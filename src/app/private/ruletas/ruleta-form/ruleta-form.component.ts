import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from 'angular-toastify';
import { RuletaService } from '../ruleta.service';

@Component({
  selector: 'app-ruleta-form',
  templateUrl: './ruleta-form.component.html',
  styleUrl: './ruleta-form.component.scss'
})
export class RuletaFormComponent implements OnInit {
  form: FormGroup;
  files: { [key: string]: File } = {};
  previewRuleta: string | null = null;
  previewBackground: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private service: RuletaService, 
    public dialogRef: MatDialogRef<RuletaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private toast: ToastService
  ) {
    this.form = fb.group({ 
      activo: [data?.activo ?? false] 
    });
  }

  ngOnInit() {
    // Si estamos editando y no es obligatorio subir nuevas imágenes
    // podrías agregar validaciones aquí si lo necesitas
  }

  onFileChange(event: any, field: string) { 
    if (event.target.files.length) {
      const file = event.target.files[0];
      this.files[field] = file;

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (field === 'imagen_ruleta') {
          this.previewRuleta = e.target.result;
        } else if (field === 'imagen_background') {
          this.previewBackground = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(field: string) {
    delete this.files[field];
    if (field === 'imagen_ruleta') {
      this.previewRuleta = null;
    } else if (field === 'imagen_background') {
      this.previewBackground = null;
    }
  }

  hasChanges(): boolean {
    // Verifica si hay cambios en el formulario o archivos nuevos
    if (Object.keys(this.files).length > 0) return true;
    if (this.data?.activo !== this.form.value.activo) return true;
    return false;
  }

  guardar() {
    if (this.form.invalid) {
      this.toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que al crear se suban ambas imágenes
    if (!this.data?.id && (!this.files['imagen_ruleta'] || !this.files['imagen_background'])) {
      this.toast.error('Debes subir ambas imágenes para crear una nueva ruleta');
      return;
    }

    const formData = new FormData();
    formData.append('activo', this.form.value.activo.toString());
    
    Object.keys(this.files).forEach(key => {
      formData.append(key, this.files[key]);
    });

    const obs = this.data?.id 
      ? this.service.update(this.data.id, formData) 
      : this.service.create(formData);
    
    obs.subscribe(
      () => { 
        this.toast.success(this.data?.id ? 'Ruleta actualizada correctamente' : 'Ruleta creada correctamente'); 
        this.dialogRef.close(true); 
      }, 
      err => {
        console.error(err);
        this.toast.error('Error al guardar la ruleta. Intenta nuevamente.');
      }
    );
  }
}
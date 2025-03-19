import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../services/company.service.ts.service';
import { ToastService } from 'angular-toastify';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
  companyForm: FormGroup;
  companyProfile: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly companyService: CompanyService,
    private readonly toastService: ToastService
  ) {
    this.companyForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(60)]],
      logo: [null],
      slogan: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      redSocial: ['', [Validators.required, Validators.pattern('https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)')]]
    });    
  }

  ngOnInit(): void {
    this.getCompanyProfile();
  }

  getCompanyProfile() {
    this.companyService.getCompanyProfile().subscribe((data: any) => {
      this.companyProfile = data;
      this.companyForm.patchValue(data);
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
  
    // Validar el tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Solo se permiten archivos JPEG, JPG y PNG.');
      return;
    }
  
    // Validar el tamaño del archivo
    if (file.size > maxSize) {
      this.toastService.error('El archivo no debe exceder los 2 MB.');
      return;
    }
  
    // Si el archivo es válido, lo agregamos al formulario y previsualizamos la imagen
    this.companyForm.patchValue({
      logo: file
    });
  
    const reader = new FileReader();
    reader.onload = () => {
      this.companyProfile.logo = reader.result;
    };
    reader.readAsDataURL(file);
  }
  

  onSubmit() {
    const formData = new FormData();
    formData.append('nombre', this.companyForm.get('nombre')?.value);
    formData.append('slogan', this.companyForm.get('slogan')?.value);
    formData.append('direccion', this.companyForm.get('direccion')?.value);
    formData.append('telefono', this.companyForm.get('telefono')?.value);
    formData.append('email', this.companyForm.get('email')?.value);
    formData.append('redSocial', this.companyForm.get('redSocial')?.value);

    if (this.companyForm.get('logo')?.value) {
      formData.append('logo', this.companyForm.get('logo')?.value);
    }

    this.companyService.updateCompanyProfile(formData).subscribe(
      () => {
        this.toastService.success('Perfil actualizado exitosamente.');
        this.getCompanyProfile();
      },
      (error) => {
        this.toastService.error('Error al actualizar el perfil.');
      }
    );
  }

}

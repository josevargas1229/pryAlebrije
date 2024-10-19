import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmailManagementService } from '../services/email-management/email-management.service.service';

@Component({
  selector: 'app-email-template-dialog',
  templateUrl: './email-template-dialog.component.html',
  styleUrls: ['./email-template-dialog.component.scss']
})
export class EmailTemplateDialogComponent implements OnInit {
  emailTemplateForm!: FormGroup;
  emailTypes: any[] = []; // Lista de tipos de correos cargados
  isViewMode: boolean = false;
  isEditMode: boolean = false;
  dialogTitle: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,  // Inyectar datos (crear, editar, ver)
    private emailService: EmailManagementService  // Servicio para cargar tipos de correos
  ) {}

  ngOnInit(): void {
    this.isViewMode = this.data?.viewMode || false;
    this.isEditMode = this.data?.editMode || false;

    // Asignar el título según el modo
    if (this.isViewMode) {
      this.dialogTitle = 'Detalles de la plantilla de correo';
    } else if (this.isEditMode) {
      this.dialogTitle = 'Editar plantilla de correo';
    } else {
      this.dialogTitle = 'Crear nueva plantilla de correo';
    }

    // Cargar los tipos de correos para el dropdown
    this.loadEmailTypes();

    // Configurar el formulario, si hay datos, los prellena
    this.emailTemplateForm = this.fb.group({
      nombre: [{ value: this.data?.nombre || '', disabled: this.isViewMode }, Validators.required],
      tipo_id: [{ value: this.data?.tipo_id || '', disabled: this.isViewMode }, Validators.required], // Tipo de correo
      asunto: [{ value: this.data?.asunto || '', disabled: this.isViewMode }, Validators.required],
      contenido_html: [{ value: this.data?.contenido_html || '', disabled: this.isViewMode }, Validators.required],
      contenido_texto: [{ value: this.data?.contenido_texto || '', disabled: this.isViewMode }, Validators.required],
      variables: [{ value: this.data?.variables || '', disabled: this.isViewMode }, Validators.required],
      activo: [{ value: this.data?.activo || false, disabled: this.isViewMode }]
    });

    // Deshabilitar formulario si está en modo vista
    if (this.isViewMode) {
      this.emailTemplateForm.disable();
    }
  }

  // Método para cargar los tipos de correo
  loadEmailTypes(): void {
    this.emailService.getAllTypes().subscribe((response: any) => {
      this.emailTypes = response.data;
    }, error => {
      console.error('Error al cargar los tipos de correo:', error);
    });
  }

  // Método para enviar los datos al componente principal
  onSubmit(): void {
    if (this.emailTemplateForm.valid) {
      this.dialogRef.close(this.emailTemplateForm.value);  // Devuelve los datos del formulario
    }
  }

  // Cancelar y cerrar el diálogo
  onCancel(): void {
    this.dialogRef.close();
  }

  // Habilitar la edición
  onEdit(): void {
    this.isViewMode = false;
    this.emailTemplateForm.enable();  // Habilitar el formulario para editar
  }
}

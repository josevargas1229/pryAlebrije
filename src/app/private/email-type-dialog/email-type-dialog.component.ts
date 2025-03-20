import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-email-type-dialog',
  templateUrl: './email-type-dialog.component.html',
  styleUrls: ['./email-type-dialog.component.scss']
})
export class EmailTypeDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  emailTypeForm!: FormGroup;
  isViewMode: boolean = false; // Para manejar el modo de vista
  isEditMode: boolean = false; // Para manejar el modo de edición
  dialogTitle: string = '';
  @ViewChild('dialogTop') dialogTop!: ElementRef;
  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Aquí se inyectan los datos
    private readonly focusMonitor: FocusMonitor
  ) {}

  ngOnInit(): void {
    this.isViewMode = this.data?.viewMode || false;
    this.isEditMode = this.data?.editMode || false;

    if (this.isViewMode) {
      this.dialogTitle = 'Detalles del tipo de correo';
    } else if (this.isEditMode) {
      this.dialogTitle = 'Editar tipo de correo';
    } else {
      this.dialogTitle = 'Crear nuevo tipo de correo';
    }

    // Configurar el formulario, si se reciben datos, los prellena para editar/ver
    this.emailTypeForm = this.fb.group({
      codigo: [{ value: this.data?.codigo || '', disabled: this.isViewMode  || this.isEditMode}, Validators.required],
      nombre: [{ value: this.data?.nombre || '', disabled: this.isViewMode }, Validators.required],
      descripcion: [{ value: this.data?.descripcion || '', disabled: this.isViewMode }],
      variables_requeridas: [{ value: this.data?.variables_requeridas || '', disabled: this.isViewMode }, Validators.required]
    });
  }
  ngAfterViewInit() {
    if (this.isViewMode) {
      setTimeout(() => {
        this.focusMonitor.focusVia(this.dialogTop, 'program');
      });
    }
  }

  ngOnDestroy() {
    if (this.dialogTop) {
      this.focusMonitor.stopMonitoring(this.dialogTop);
    }
  }
  onSubmit() {
    if (this.emailTypeForm.valid) {
      this.dialogRef.close(this.emailTypeForm.value); // Devuelve el formulario al componente principal
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.isViewMode = false; // Permite la edición si se estaba en modo vista
    this.emailTypeForm.enable(); // Habilitar los campos para edición
  }
}

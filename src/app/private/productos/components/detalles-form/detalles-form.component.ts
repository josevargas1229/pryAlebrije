import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-detalles-form',
  templateUrl: './detalles-form.component.html',
  styleUrl: './detalles-form.component.scss'
})
export class DetallesFormComponent implements OnInit {
  detalleForm: FormGroup;
  esColor: boolean = false;
  titulo: string = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DetallesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string }
  ) {
    this.titulo = data.title;
    this.esColor = data.type === 'color';

    this.detalleForm = this.fb.group({
      nombre: ['', [Validators.required]],
      hex: this.esColor ? ['#000000', Validators.required] : null,
    });
  }

  ngOnInit(): void {}

  guardar(): void {
    if (this.detalleForm.valid) {
      this.dialogRef.close(this.detalleForm.value);
    }
  }
}

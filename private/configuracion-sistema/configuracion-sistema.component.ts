import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfiguracionSistemaService } from '../services/configuracion/configuracion-sistema.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-configuracion-sistema',
  templateUrl: './configuracion-sistema.component.html',
  styleUrls: ['./configuracion-sistema.component.scss']
})
export class ConfiguracionSistemaComponent implements OnInit {
  configForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private configuracionSistema: ConfiguracionSistemaService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadConfiguration();
  }

  // Inicializar el formulario con validaciones
  initializeForm(): void {
    this.configForm = this.fb.group({
      max_intentos_login: [3, [Validators.required, Validators.min(3)]],
      tiempo_bloqueo_minutos: [1, [Validators.required, Validators.min(1)]]
    });
  }

  // Cargar la configuración actual del servidor
  loadConfiguration(): void {
    this.configuracionSistema.getConfiguration().subscribe(
      (config) => {
        this.configForm.patchValue(config);
        this.loading = false;
      },
      (error) => {
        this.toastService.error('Error al cargar la configuración'); // Reemplaza el snackbar por Toastify
        this.loading = false;
      }
    );
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    if (this.configForm.invalid) {
      return;
    }

    this.configuracionSistema.updateConfiguration(this.configForm.value).subscribe(
      (response) => {
        this.toastService.success('Configuración actualizada correctamente'); // Reemplaza el snackbar por Toastify
      },
      (error) => {
        this.toastService.error('Error al actualizar la configuración'); // Reemplaza el snackbar por Toastify
      }
    );
  }
}
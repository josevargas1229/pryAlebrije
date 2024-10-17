import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

/**
 * @title Configuración del Usuario
 */
@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    AsyncPipe
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  isModalOpen = false;
  isCodeVerified = false; // Estado para verificar el código
  errorMessage: string | null = null; // Mensaje de error

  private _formBuilder = inject(FormBuilder);
  private http = inject(HttpClient); // Inyectar HttpClient

  // Definición de formularios
  emailFormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  verificationFormGroup = this._formBuilder.group({
    verificationCode: ['', Validators.required],
  });

  passwordFormGroup = this._formBuilder.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  // Formularios del stepper
  firstFormGroup = this._formBuilder.group({
    name: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    address: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    phone: ['', Validators.required],
  });

  stepperOrientation: Observable<string>;

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  // Abrir el modal
  openModal() {
    this.isModalOpen = true;
    this.errorMessage = null; // Reiniciar mensaje de error al abrir el modal
  }

  // Cerrar el modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Métodos para manejar el envío de formularios
  onSubmitEmail() {
    if (this.emailFormGroup.valid) {
      const email = this.emailFormGroup.value.email;
      this.http.post('http://localhost:3000/check-password/send-code', { email })
        .subscribe({
          next: (response) => {
            console.log('Correo enviado', response);
          },
          error: (error) => {
            this.errorMessage = 'Error al enviar el correo. Por favor, inténtelo de nuevo.';
            console.error('Error al enviar correo', error);
          }
        });
    } else {
      this.errorMessage = 'Por favor, ingrese un correo electrónico válido.'; // Mensaje para el usuario
    }
  }

  onSubmitVerification() {
    if (this.emailFormGroup.valid && this.verificationFormGroup.valid) {
      const email = this.emailFormGroup.value.email;
      const verificationCode = this.verificationFormGroup.value.verificationCode;

      const verificationData = {
        email: email,
        verificationCode: verificationCode
      };

      this.http.post('http://localhost:3000/check-password/verify-code', verificationData)
        .subscribe({
          next: (response) => {
            this.isCodeVerified = true;
            console.log('Código verificado', response);
          },
          error: (error) => {
            this.isCodeVerified = false;
            this.errorMessage = 'Error al verificar el código. Por favor, inténtelo de nuevo.';
            console.error('Error al verificar código', error.error || 'Error desconocido');
          }
        });
    }
  }

  onSubmitPassword() {
    if (this.passwordFormGroup.valid && this.isCodeVerified) {
      const newPassword = this.passwordFormGroup.value.newPassword;
      const confirmPassword = this.passwordFormGroup.value.confirmPassword;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        return; // No continuar si no coinciden
      }

      const passwordData = {
        email: this.emailFormGroup.value.email,
        newPassword: newPassword
      };
      this.http.post('http://localhost:3000/check-password/change-password', passwordData)
        .subscribe({
          next: (response) => {
            console.log('Contraseña cambiada', response);
            this.closeModal(); // Cerrar el modal aquí
          },
          error: (error) => {
            this.errorMessage = 'Error al cambiar la contraseña. Por favor, inténtelo de nuevo.';
            console.error('Error al cambiar contraseña', error);
          }
        });
    } else if (!this.isCodeVerified) {
      this.errorMessage = 'El código de verificación no ha sido validado.';
    }
  }
}

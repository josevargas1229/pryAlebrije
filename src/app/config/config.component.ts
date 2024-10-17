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
import { PasswordService } from '../services/password/password.service';

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
  isCodeVerified = false;
  errorMessage: string | null = null;

  private _formBuilder = inject(FormBuilder);
  private passwordService = inject(PasswordService);

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
  stepperOrientation: Observable<string>;
  constructor() {
    const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  openModal() {
    this.isModalOpen = true;
    this.errorMessage = null;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmitEmail() {
    if (this.emailFormGroup.valid) {
      const email= this.emailFormGroup.value.email?? '';;
      this.passwordService.sendVerificationCode(email).subscribe({
        next: (response) => {
          console.log('Correo enviado', response);
        },
        error: (error) => {
          this.errorMessage = 'Error al enviar el correo. Por favor, inténtelo de nuevo.';
          console.error('Error al enviar correo', error);
        }
      });
    } else {
      this.errorMessage = 'Por favor, ingrese un correo electrónico válido.';
    }
  }

  onSubmitVerification() {
    if (this.emailFormGroup.valid && this.verificationFormGroup.valid) {
      const email = this.emailFormGroup.value.email?? '';;
      const verificationCode = this.verificationFormGroup.value.verificationCode?? '';;
      this.passwordService.verifyCode(email, verificationCode).subscribe({
        next: (response) => {
          this.isCodeVerified = true;
          console.log('Código verificado', response);
        },
        error: (error) => {
          this.isCodeVerified = false;
          this.errorMessage = 'Error al verificar el código. Por favor, inténtelo de nuevo.';
          console.error('Error al verificar código', error);
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
        return;
      }

      const email = this.emailFormGroup.value.email;
      this.passwordService.changePassword(email?? '', newPassword?? '').subscribe({
        next: (response) => {
          console.log('Contraseña cambiada', response);
          this.closeModal();
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

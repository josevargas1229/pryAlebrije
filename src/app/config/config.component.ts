import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { PasswordService } from '../services/password/password.service';
import { UserService } from '../services/user/user.service';
import { Usuario } from '../services/user/user.models';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from 'angular-toastify';

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
    AsyncPipe,
    MatIconModule
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  isModalOpen = false;
  isCodeVerified = false;
  isEmailSent = false;
  errorMessage: string | null = null;
  usuario: Usuario | null = null;
  private _formBuilder = inject(FormBuilder);
  private passwordService = inject(PasswordService);

  emailFormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  verificationFormGroup = this._formBuilder.group({
    verificationCode: ['', Validators.required],
  });


  currentPasswordFormGroup = this._formBuilder.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  newPasswordFormGroup = this._formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  stepperOrientation: Observable<string>;

  constructor(private userService: UserService, private toastService: ToastService) {
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

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(
      (data) => {
        this.usuario = data;
      },
      (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    );
  }

  editarCampo(campo: string): void {
    console.log(`Editando el campo: ${campo}`);
  }

  onSubmitEmail(stepper: MatStepper) {
    if (this.emailFormGroup.valid) {
      const email = this.emailFormGroup.value.email ?? '';
      this.passwordService.sendVerificationCode(email).subscribe({
        next: (response) => {
          console.log('Correo enviado', response);
          this.toastService.success('Correo enviado correctamente');
          stepper.next();
        },
        error: (error) => {
          this.errorMessage = 'Error al enviar el correo. Por favor, inténtelo de nuevo.';
          this.toastService.error(this.errorMessage);
          console.error('Error al enviar correo', error);
        }
      });
    } else {
      this.errorMessage = 'Por favor, ingrese un correo electrónico válido.';
    }
  }

  onSubmitVerification(stepper: MatStepper) {
    if (this.emailFormGroup.valid && this.verificationFormGroup.valid) {
      const email = this.emailFormGroup.value.email ?? '';
      const verificationCode = this.verificationFormGroup.value.verificationCode ?? '';
      this.passwordService.verifyCode(email, verificationCode).subscribe({
        next: (response) => {
          this.isCodeVerified = true;
          console.log('Código verificado', response);
          this.toastService.success('Código verificado');
          stepper.next();
        },
        error: (error) => {
          this.isCodeVerified = false;
          this.errorMessage = 'Error al verificar el código. Por favor, inténtelo de nuevo.';
          this.toastService.error(this.errorMessage);
          console.error('Error al verificar código', error);
        }
      });
    }
  }

  onSubmitCurrentPassword(stepper: MatStepper) {
    if (this.currentPasswordFormGroup.valid) {
      console.log('Current password validated');
      stepper.next();
    } else {
      this.errorMessage = 'La contraseña actual es inválida.';
    }
  }

  onSubmitNewPassword(stepper: MatStepper) {
    if (this.newPasswordFormGroup.valid && this.isCodeVerified) {
      const newPassword = this.newPasswordFormGroup.value.newPassword;
      const confirmPassword = this.newPasswordFormGroup.value.confirmPassword;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        return;
      }

      const email = this.emailFormGroup.value.email;
      this.passwordService.changePassword(email ?? '', newPassword ?? '').subscribe({
        next: (response) => {
          console.log('Contraseña cambiada', response);
          this.closeModal();
          this.toastService.success('Contraseña cambiada exitosamente');
          stepper.next();
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
          this.toastService.error(errorMessage);
          console.error('Error al cambiar contraseña', error);
        }
      });
    } else if (!this.isCodeVerified) {
      this.errorMessage = 'El código de verificación no ha sido validado.';
    }
  }
}

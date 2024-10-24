import { Component, inject, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { map, Observable } from 'rxjs';
import { UserService } from '../services/user/user.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ToastService } from 'angular-toastify';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../services/user/user.models';
import { PasswordService } from '../services/password/password.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recupera',
  standalone: true,
  imports:[
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    AsyncPipe,
    MatIconModule
  ],
  templateUrl: './recupera.component.html',
  styleUrls: ['./recupera.component.scss']
})
export class RecuperaComponent {
  @ViewChild('stepper') stepper!: MatStepper;
  isModalOpen = false;
  isCodeVerified = false;
  isEmailSent = false;
  errorMessage: string | null = null;
  usuario: Usuario | null = null;
  private _formBuilder = inject(FormBuilder);
  private passwordService = inject(PasswordService);

  stepPermissions = {
    emailStep: true,      // Primer paso siempre accesible
    verificationStep: false,
    passwordStep: false,
    doneStep: false
  };
  emailFormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  verificationFormGroup = this._formBuilder.group({
    verificationCode: ['', Validators.required],
  });

  passwordFormGroup = this._formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  stepperOrientation: Observable<string>;

  constructor(
    private userService: UserService, 
    private toastService: ToastService,
    private router: Router
  ) {
    const breakpointObserver = inject(BreakpointObserver);
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  // Método para controlar la navegación del stepper
  selectionChange(event: any): void {
    const selectedIndex = event.selectedIndex;
    const previousIndex = event.previouslySelectedIndex;

    // Si intenta avanzar sin permiso, regresa al paso anterior
    if (!this.canAccessStep(selectedIndex)) {
      setTimeout(() => {
        this.stepper.selectedIndex = previousIndex;
      });
    }
  }

  // Método para verificar si se puede acceder a un paso específico
  canAccessStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: // Email step
        return this.stepPermissions.emailStep;
      case 1: // Verification step
        return this.stepPermissions.verificationStep;
      case 2: // Password step
        return this.stepPermissions.passwordStep;
      case 3: // Done step
        return this.stepPermissions.doneStep;
      default:
        return false;
    }
  }

  onSubmitEmail(event: Event) {
    event.preventDefault();
    if (this.emailFormGroup.valid) {
      const email = this.emailFormGroup.value.email ?? '';
      this.passwordService.sendVerificationCode(email).subscribe({
        next: (response) => {
          this.isEmailSent = true;
          this.stepPermissions.verificationStep = true; // Habilita el siguiente paso
          this.toastService.success('Correo enviado correctamente');
          this.stepper.next();
        },
        error: (error) => {
          this.isEmailSent = false;
          this.stepPermissions.verificationStep = false;
          const errorMessage = error.error?.error || 'Error al enviar el correo. Por favor, inténtelo de nuevo.';
        this.toastService.error(errorMessage);
        }
      });
    }
  }

  onSubmitVerification(event: Event) {
    event.preventDefault();
    if (this.verificationFormGroup.valid) {
      const email = this.emailFormGroup.value.email ?? '';
      const verificationCode = this.verificationFormGroup.value.verificationCode ?? '';
      this.passwordService.verifyCode(email, verificationCode).subscribe({
        next: (response) => {
          this.isCodeVerified = true;
          this.stepPermissions.passwordStep = true; // Habilita el siguiente paso
          this.toastService.success('Código verificado correctamente');
          this.stepper.next();
        },
        error: (error) => {
          this.isCodeVerified = false;
          this.stepPermissions.passwordStep = false;
          const errorMessage = error.error?.error || 'Código de verificación inválido';
        this.toastService.error(errorMessage);
        }
      });
    }
  }

  onSubmitPassword(event: Event) {
    event.preventDefault();
    if (this.passwordFormGroup.valid && this.isCodeVerified) {
      const newPassword = this.passwordFormGroup.value.newPassword;
      const confirmPassword = this.passwordFormGroup.value.confirmPassword;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        this.toastService.error(this.errorMessage);
        return;
      }

      const email = this.emailFormGroup.value.email;
      this.passwordService.changePassword(email ?? '', newPassword ?? '').subscribe({
        next: (response) => {
          this.stepPermissions.doneStep = true; // Habilita el paso final
          this.toastService.success('Contraseña cambiada exitosamente');
          this.stepper.next();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.stepPermissions.doneStep = false;
          const errorMessage = error?.error?.error || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }
}
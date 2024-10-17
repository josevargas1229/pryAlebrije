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

  constructor(private userService: UserService, private toastService:ToastService) {
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
    // Lógica para editar el campo (mostrar modal o formulario de edición)
    console.log(`Editando el campo: ${campo}`);
  }
  onSubmitEmail(stepper: MatStepper) {
    if (this.emailFormGroup.valid) {
      const email = this.emailFormGroup.value.email ?? '';
      this.passwordService.sendVerificationCode(email).subscribe({
        next: (response) => {
          console.log('Correo enviado', response);
          this.toastService.success('Correo enviado correctamente');
          stepper.next(); // Avanza al siguiente paso solo si el correo se envió exitosamente
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
          stepper.next(); // Avanza al siguiente paso solo si el código es correcto
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
  
  onSubmitPassword(stepper: MatStepper) {
    if (this.passwordFormGroup.valid && this.isCodeVerified) {
      const newPassword = this.passwordFormGroup.value.newPassword;
      const confirmPassword = this.passwordFormGroup.value.confirmPassword;
  
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
          stepper.next(); // Avanza al paso final si la contraseña se cambió exitosamente
        },
        error: (error) => {
          const errorMessage = error?.error?.error || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
        this.toastService.error(errorMessage); // Mostrar el mensaje de error específico
        console.error('Error al cambiar contraseña', error);
        }
      });
    } else if (!this.isCodeVerified) {
      this.errorMessage = 'El código de verificación no ha sido validado.';
    }
  }
}

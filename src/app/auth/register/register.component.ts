import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import DOMPurify from 'dompurify';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../services/user/user.models';
import { Cuenta } from '../../services/account/account.models';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { AccountService } from '../../services/account/account.service';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-user-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatGridListModule,MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  isSubmitting = false;
  passwordStrengthMessage: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  feedbackMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑäöüÄÖÜ\s]+$/)]],
      surnamePaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑäöüÄÖÜ\s]+$/)]],
      surnameMaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑäöüÄÖÜ\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator.bind(this)]],
      confirmPassword: ['', [Validators.required, this.matchPassword.bind(this)]],
    });

    // Escucha cambios en el campo de contraseña
    this.registrationForm.get('password')?.valueChanges.subscribe((password) => {
      this.checkPasswordStrength(password);
    });
  }
  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input); // Sanitizamos la entrada para eliminar cualquier script o carácter peligroso
  }
  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;

    // Criterios de fortaleza
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [
      lengthCriteria,
      numberCriteria,
      uppercaseCriteria,
      lowercaseCriteria,
      specialCharCriteria
    ].filter(Boolean).length;

    // Si no cumple con suficientes criterios, devuelve el error
    return criteriaMet < 4 ? { weakPassword: true } : null;
  }

  checkPasswordStrength(password: string) {
    if (password.length === 0) {
      this.passwordStrengthMessage = '';
      return;
    }

    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [lengthCriteria, numberCriteria, uppercaseCriteria, lowercaseCriteria, specialCharCriteria].filter(Boolean).length;

    switch (criteriaMet) {
      case 0:
      case 1:
        this.passwordStrengthMessage = 'Muy débil';
        break;
      case 2:
        this.passwordStrengthMessage = 'Débil';
        break;
      case 3:
        this.passwordStrengthMessage = 'Normal';
        break;
      case 4:
        this.passwordStrengthMessage = 'Fuerte';
        break;
      case 5:
        this.passwordStrengthMessage = 'Muy fuerte';
        break;
    }
  }

  matchPassword(control: AbstractControl): ValidationErrors | null {
    if (!this.registrationForm) {
      return null;
    }
    const password = this.registrationForm.get('password')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.registrationForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
  onSubmit() {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      if (this.registrationForm.get('password')?.hasError('weakPassword')) {
        this.toastService.info('La contraseña no es lo suficientemente fuerte. Debe tener al menos 8 caracteres, un número, una letra mayúscula, una minúscula y un carácter especial.');
        this.isSubmitting = false;
        return;
      }
      const password = this.registrationForm.value.password;
      this.accountService.checkPassword(password).subscribe(
        (response) => {
          // Mostrar el mensaje de advertencia si la contraseña ha sido filtrada
          if (response.message.includes('filtrada')) {
            this.feedbackMessage = response.message; // Guarda el mensaje de advertencia
            this.toastService.error(this.feedbackMessage)
            this.isSubmitting = false; // Permite que el usuario vuelva a intentarlo
          } else {
            this.registerUser(); // Procede con el registro si la contraseña no está filtrada
          }
        },
        (error) => {
          // Manejar cualquier otro error
          this.feedbackMessage = 'Ocurrió un error al verificar la contraseña.';
          this.toastService.error(this.feedbackMessage)
          this.isSubmitting = false;
        }
      );

    } else {
      Object.values(this.registrationForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  private registerUser() {
    // Sanitizar los valores del formulario antes de procesarlos
    const sanitizedNombre = this.sanitizeInput(this.registrationForm.value.name);
    const sanitizedApellidoPaterno = this.sanitizeInput(this.registrationForm.value.surnamePaterno);
    const sanitizedApellidoMaterno = this.sanitizeInput(this.registrationForm.value.surnameMaterno);
    const sanitizedEmail = this.sanitizeInput(this.registrationForm.value.email);
    const sanitizedTelefono = this.sanitizeInput(this.registrationForm.value.phone);

    const usuario: Partial<Usuario> = {
      nombre: sanitizedNombre,
      apellido_paterno: sanitizedApellidoPaterno,
      apellido_materno: sanitizedApellidoMaterno,
      email: sanitizedEmail,
      telefono: sanitizedTelefono,
      rol_id: 3
    };

    const cuenta: Partial<Cuenta> = {
      nombre_usuario: sanitizedNombre,
      contraseña_hash: this.registrationForm.value.password
    };

    this.authService.register(usuario, cuenta).subscribe(
      (response) => {
        this.toastService.success('Usuario registrado exitosamente.');
        this.isSubmitting = false;
        this.authService.sendVerificationCode(sanitizedEmail).subscribe(
          () => {
            this.toastService.info('Se ha enviado un correo de verificación. Por favor, revisa tu bandeja de entrada.');
            this.router.navigate(['/verificacion'], { queryParams: { email: sanitizedEmail } });
          },
          (error) => {
            this.toastService.error('Error al enviar el correo de verificación.');
            console.error('Error al enviar el correo de verificación:', error);
          }
        );
      },
      (error) => {
        if (error.status === 400 && error.error.errors) {
          error.error.errors.forEach((err: { field: string, message: string }) => {
            if (err.field === 'email') {
              this.toastService.error('El correo electrónico ya está registrado.');
            } else if (err.field === 'telefono') {
              this.toastService.error('El número de teléfono ya está registrado.');
            } else {
              this.toastService.error(`Error en ${err.field}: ${err.message}`);
            }
          });
        } else {
          this.toastService.error('Error al registrar el usuario.');
        }
        this.isSubmitting = false;
        console.error('Error al registrar el usuario:', error);
      }
    );
  }

}

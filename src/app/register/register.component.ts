import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import * as passwordStrength from 'owasp-password-strength-test';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Usuario } from '../services/user/user.models';
import { Cuenta } from '../services/account/account.models';
import { AuthService } from '../services/auth/auth.service';
@Component({
  selector: 'app-user-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatFormFieldModule,FormsModule, MatInputModule, MatSelectModule,MatIconModule,MatGridListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  isSubmitting = false;
  passwordStrengthMessage: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      surname: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchPassword.bind(this)]],
    });
    this.registrationForm.get('password')?.valueChanges.subscribe((password) => {
      this.checkPasswordStrength(password);
    });
  }

  checkPasswordStrength(password: string) {
    // Evaluar la fortaleza de la contraseña
    if (password.length === 0) {
      this.passwordStrengthMessage = ''; // No mostrar nada si la contraseña está vacía
      return;
    }

    const lengthCriteria = password.length >= 8; // Al menos 8 caracteres
    const numberCriteria = /[0-9]/.test(password); // Al menos un número
    const uppercaseCriteria = /[A-Z]/.test(password); // Al menos una letra mayúscula
    const lowercaseCriteria = /[a-z]/.test(password); // Al menos una letra minúscula
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Al menos un carácter especial

    const criteriaMet = [
      lengthCriteria,
      numberCriteria,
      uppercaseCriteria,
      lowercaseCriteria,
      specialCharCriteria
    ].filter(Boolean).length; // Contar cuántos criterios se cumplen

    // Establecer el mensaje de fortaleza
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
    
    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    
    return null;
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

      const usuario: Partial<Usuario> = {
        nombre: this.registrationForm.value.name,
        email: this.registrationForm.value.email,
        telefono: this.registrationForm.value.phone,
        tipo_usuario: 'Cliente'
      };

      const cuenta: Partial<Cuenta> = {
        nombre_usuario: this.registrationForm.value.name,
        contraseña_hash: this.registrationForm.value.password,
        fecha_creacion: new Date(),
        ultimo_acceso: new Date()
      };

      this.authService.register(usuario, cuenta).subscribe(
        (response) => {
          console.log('Usuario registrado exitosamente:', response);
          this.isSubmitting = false;
          // Aquí podrías redirigir al usuario o mostrar un mensaje de éxito
        },
        (error) => {
          console.error('Error al registrar el usuario:', error);
          this.isSubmitting = false;
          // Manejo de errores: mostrar un mensaje al usuario
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
}
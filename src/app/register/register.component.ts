import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import * as passwordStrength from 'owasp-password-strength-test';

@Component({
  selector: 'app-user-registration',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  isSubmitting = false;
  passwordStrengthMessage: string = ''; // Cambiado a passwordStrengthMessage
  passwordMismatch: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Observa los cambios en el campo de la contraseña
    this.registrationForm.get('password')?.valueChanges.subscribe((password) => {
      this.checkPasswordStrength(password);
      this.checkPasswordMatch();
    });

    // Observa los cambios en el campo de confirmación de contraseña
    this.registrationForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
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

  checkPasswordMatch() {
    const password = this.registrationForm.get('password')?.value;
    const confirmPassword = this.registrationForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  onSubmit() {
    if (this.registrationForm.valid && !this.passwordMismatch) {
      this.isSubmitting = true;
      // Simular llamada a la API
      setTimeout(() => {
        console.log(this.registrationForm.value);
        this.isSubmitting = false;
        // Aquí enviarías los datos del formulario a tu backend
      }, 2000);
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

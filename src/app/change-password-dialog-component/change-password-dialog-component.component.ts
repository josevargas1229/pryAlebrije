import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-change-password-dialog',
  standalone:true,
  imports:[CommonModule, FormsModule, MatFormFieldModule,ReactiveFormsModule,MatButtonModule,MatInputModule,MatTooltipModule,MatIconModule],
  templateUrl: './change-password-dialog-component.component.html',
  styleUrls: ['./change-password-dialog-component.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit{
  newPasswordFormGroup!: FormGroup;
  errorMessage: string | null = null;
  passwordStrengthMessage: string = '';
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>
  ) {}
  ngOnInit() {
    this.newPasswordFormGroup = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator.bind(this)]],
      confirmPassword: ['', [Validators.required, this.matchPassword.bind(this)]],
    });

    this.newPasswordFormGroup.get('newPassword')?.valueChanges.subscribe((password) => {
      this.checkPasswordStrength(password);
    });
  }

  onSubmit() {
    if (this.newPasswordFormGroup.valid) {
      this.dialogRef.close(this.newPasswordFormGroup.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
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
    if (!this.newPasswordFormGroup) {
      return null;
    }
    const password = this.newPasswordFormGroup.get('newPassword')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.newPasswordFormGroup.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}

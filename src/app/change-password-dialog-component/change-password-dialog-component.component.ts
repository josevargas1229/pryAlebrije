import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatTooltipModule, MatIconModule, MatProgressBarModule],
  templateUrl: './change-password-dialog-component.component.html',
  styleUrls: ['./change-password-dialog-component.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  newPasswordFormGroup!: FormGroup;
  errorMessage: string | null = null;
  passwordStrengthMessage: string = '';
  passwordStrengthScore: number = 0;
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
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchPassword.bind(this) });

    this.newPasswordFormGroup.get('newPassword')?.valueChanges.subscribe((password) => {
      this.checkPasswordStrength(password);
    });
  }

  onSubmit() {
    if (this.newPasswordFormGroup.valid) {
      const sanitizedValues = {
        currentPassword: this.sanitizeInput(this.newPasswordFormGroup.value.currentPassword),
        newPassword: this.sanitizeInput(this.newPasswordFormGroup.value.newPassword),
        confirmPassword: this.sanitizeInput(this.newPasswordFormGroup.value.confirmPassword)
      };
      this.dialogRef.close(sanitizedValues);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input);
  }

  private strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value || '';
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [lengthCriteria, numberCriteria, uppercaseCriteria, lowercaseCriteria, specialCharCriteria].filter(Boolean).length;
    return criteriaMet < 4 ? { weakPassword: true } : null;
  }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrengthScore = 0;
      this.passwordStrengthMessage = '';
      return;
    }

    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [lengthCriteria, numberCriteria, uppercaseCriteria, lowercaseCriteria, specialCharCriteria].filter(Boolean).length;

    this.passwordStrengthScore = criteriaMet * 20; // 0-100
    this.passwordStrengthMessage = criteriaMet < 4 ? 'Mejora tu contraseña' : 'Contraseña válida';
  }

  getProgressBarClass(): string {
    if (this.passwordStrengthScore <= 40) {
      return 'progress-red';
    } else if (this.passwordStrengthScore <= 60) {
      return 'progress-orange';
    } else if (this.passwordStrengthScore <= 80) {
      return 'progress-yellow';
    } else {
      return 'progress-green';
    }
  }

  getNewPasswordErrorMessage(): string {
    const newPasswordControl = this.newPasswordFormGroup.get('newPassword');
    if (newPasswordControl?.hasError('required')) {
      return 'La nueva contraseña es requerida';
    }
    if (newPasswordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (newPasswordControl?.hasError('weakPassword')) {
      return 'La contraseña debe ser más fuerte';
    }
    return '';
  }

  matchPassword(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmPasswordControl = this.newPasswordFormGroup.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      return 'La confirmación es requerida';
    }
    if (this.newPasswordFormGroup?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
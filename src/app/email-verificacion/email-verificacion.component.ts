import { Component } from '@angular/core';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from 'angular-toastify';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-email-verificacion',
  standalone: true,
  imports: [FormsModule,CommonModule,MatButtonModule,MatFormFieldModule,ReactiveFormsModule,MatSpinner,MatIcon],
  templateUrl: './email-verificacion.component.html',
  styleUrl: './email-verificacion.component.scss'
})
export class EmailVerificacionComponent {
  userEmail: string = ''; // Para almacenar el email
  isVerified = false;
  token: string ='';
  loading = true;
  buttonLoading = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Capturar el email desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
      this.token = params['token'] || null;
      if (this.token) {
        this.verifyToken();
      } else {
        this.loading = false;
      }
    });
  }

  // Método para reenviar el correo de verificación
  resendEmail() {
    this.buttonLoading = true;
    this.authService.resendVerificationEmail(this.userEmail).subscribe({
      next: () => {
        this.toastService.success('Correo de verificación reenviado.');
        this.buttonLoading = false;
      },
      error: (error) => {
        this.toastService.error('Error al reenviar el correo.');
        console.error('Error al reenviar el correo de verificación', error);
        this.buttonLoading = false;
      }
    });
  }

  // Verificar el token ingresado como parámetro
  verifyToken() {
    this.authService.verifyAccount(this.token).subscribe({
      next: () => {
        this.loading = false;
        this.isVerified = true;
        this.toastService.success('Cuenta verificada exitosamente.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error('Error al verificar la cuenta.');
        console.error('Error al verificar el token', error);
      }
    });
  }
}
import { Component } from '@angular/core';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { ToastService } from 'angular-toastify';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-email-verificacion',
  standalone: true,
  imports: [FormsModule,CommonModule,MatButtonModule,MatFormFieldModule,ReactiveFormsModule],
  templateUrl: './email-verificacion.component.html',
  styleUrl: './email-verificacion.component.scss'
})
export class EmailVerificacionComponent {
  userEmail: string = ''; // Para almacenar el email
  isVerified = false;
  token: string ='';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Capturar el email desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || ''; // Obtener el email
      this.token = params['token'] || null; // Obtener el token si existe
      if (this.token) {
        this.verifyToken();
      }
    });
  }

  // Método para reenviar el correo de verificación
  resendEmail() {
    this.authService.resendVerificationEmail(this.userEmail).subscribe({
      next: () => {
        this.toastService.success('Correo de verificación reenviado.');
      },
      error: (error) => {
        this.toastService.error('Error al reenviar el correo.');
        console.error('Error al reenviar el correo de verificación', error);
      }
    });
  }

  // Verificar el token ingresado como parámetro
  verifyToken() {
    this.authService.verifyAccount(this.token).subscribe({
      next: () => {
        this.isVerified = true;
        this.toastService.success('Cuenta verificada exitosamente.');
        setTimeout(() => {
          this.router.navigate(['/login']); // Redirigir al login después de unos segundos
        }, 3000);
      },
      error: (error) => {
        this.toastService.error('Error al verificar la cuenta.');
        console.error('Error al verificar el token', error);
      }
    });
  }
}
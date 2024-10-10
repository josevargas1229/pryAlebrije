import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { LoginCredentials } from '../services/auth/auth.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastService } from 'angular-toastify';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, FormsModule, MatInputModule, MatIconModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private toastService: ToastService, private router: Router) { }

  ngOnInit(): void {
    // Verifica si hay credenciales guardadas si se usó "remember me" anteriormente
    const savedCredentials = this.authService.getRememberMe();
    if (savedCredentials) {
      this.email = savedCredentials.credenciales.email;
      this.password = savedCredentials.credenciales.contraseña;
      this.rememberMe = true;
    }
  }

  onSubmit(): void {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = null; // Reinicia el mensaje de error

      const credenciales: LoginCredentials = {
        email: this.email,
        contraseña: this.password,
      };

      this.authService.login(credenciales, this.rememberMe).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          this.toastService.success('¡Bienvenido! Inicio de sesión exitoso.');
          this.router.navigate(['/'])
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.toastService.error(error.message); // Muestra el mensaje de error lanzado por AuthService
        },
      });
    }
  }
}

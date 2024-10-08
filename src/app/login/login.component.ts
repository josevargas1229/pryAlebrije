import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';
import { LoginCredentials } from '../services/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone:true,
  imports:[FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

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
          // Redirigir al usuario a la página de inicio u otra página después del inicio de sesión exitoso
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
          this.isLoading = false;
        },
      });
    }
  }
}

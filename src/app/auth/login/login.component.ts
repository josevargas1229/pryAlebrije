import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { LoginCredentials } from '../../services/auth/auth.models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastService } from 'angular-toastify';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { RecaptchaModule, RecaptchaFormsModule, RecaptchaComponent } from 'ng-recaptcha-2';
import { environment } from '../../../environments/environment';
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    RecaptchaFormsModule,
    RecaptchaModule,
    LoadingButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  hidePassword: boolean = true;
  captchaSiteKey: string = environment.recaptchaSiteKey;
  captchaToken: string | null = null;
  constructor(private authService: AuthService, private toastService: ToastService, private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Verifica si hay credenciales guardadas si se usó "remember me" anteriormente
    const savedCredentials = this.authService.getRememberMe();
    if (savedCredentials) {
      this.email = savedCredentials.credenciales.email;
      this.password = savedCredentials.credenciales.contraseña;
      this.rememberMe = true;
    }
  }

  onSubmit(form: NgForm): void {
  if (form.valid && this.captchaToken) {
    this.isLoading = true;
    this.errorMessage = null;

    const credenciales: LoginCredentials = {
      email: this.email,
      contraseña: this.password
    };

    const clientId = this.route.snapshot.queryParamMap.get('client_id');
    const redirectUri = this.route.snapshot.queryParamMap.get('redirect_uri');
    const state = this.route.snapshot.queryParamMap.get('state');

    console.log('Enviando solicitud de login:', { credenciales, clientId, redirectUri, state });

    this.authService.login(credenciales, this.captchaToken, this.rememberMe, clientId, redirectUri, state).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response?.verified) {
          this.router.navigate(['/verificacion'], { queryParams: { email: credenciales.email } });
          return;
        }
        this.toastService.success('¡Bienvenido! Inicio de sesión exitoso.');
        this.authService.setUserRole(response.tipo);
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        this.router.navigate([redirectUrl]).then(() => {
          localStorage.removeItem('redirectUrl');
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.captchaToken = null;
        this.captchaRef.reset();
        this.toastService.error(error.message || 'Error al iniciar sesión');
      },
      complete: () => {
        this.isLoading = false;
        console.log('Solicitud completada (posible redirección de Alexa)');
      }
    });
  } else if (!this.captchaToken) {
    this.errorMessage = 'Por favor, completa el reCAPTCHA para continuar.';
  }
}

  resolved(captchaResponse: string | null): void {
    this.captchaToken = captchaResponse;
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hidePassword = !this.hidePassword;
  }
}

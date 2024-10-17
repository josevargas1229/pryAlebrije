import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recupera',
  standalone: true,
  templateUrl: './recupera.component.html',
  styleUrls: ['./recupera.component.scss']
})
export class RecuperaComponent {
  email: string = '';
  verificationCode1: string = '';
  verificationCode2: string = '';
  verificationCode3: string = '';
  verificationCode4: string = '';
  verificationCode5: string = '';
  verificationCode6: string = '';
  verificationCode7: string = '';
  verificationCode8: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isModalOpen = false;
  isChangePasswordModalOpen = false;

  constructor(private http: HttpClient) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openChangePasswordModal() {
    this.isModalOpen = false; // Cerrar el modal de verificación
    this.isChangePasswordModalOpen = true; // Abrir el modal de cambio de contraseña
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpen = false;
  }

  // Métodos para manejar las entradas
  onEmailInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email = target.value;
  }

  onVerificationCodeInput(event: Event, codePosition: number) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Guardar cada dígito en la posición correspondiente
    switch (codePosition) {
      case 1: this.verificationCode1 = value; break;
      case 2: this.verificationCode2 = value; break;
      case 3: this.verificationCode3 = value; break;
      case 4: this.verificationCode4 = value; break;
      case 5: this.verificationCode5 = value; break;
      case 6: this.verificationCode6 = value; break;
      case 7: this.verificationCode7 = value; break;
      case 8: this.verificationCode8 = value; break;
    }
  }

  onNewPasswordInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newPassword = target.value;
  }

  onConfirmPasswordInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.confirmPassword = target.value;
  }

  // Métodos para manejar el envío de formularios
  onSubmitEmail() {
    if (this.email) {
      this.http.post('http://localhost:3000/check-password/send-code', { email: this.email })
        .subscribe({
          next: (response) => {
            console.log('Correo enviado', response);
            this.openModal();
          },
          error: (error) => {
            console.error('Error al enviar correo', error);
            alert('Ocurrió un error al intentar enviar el correo. Por favor, intenta nuevamente.');
          }
        });
    }
  }



  onSubmitVerification() {
    const verificationCode = this.verificationCode1 + this.verificationCode2 + this.verificationCode3 + this.verificationCode4 +
                             this.verificationCode5 + this.verificationCode6 + this.verificationCode7 + this.verificationCode8;

    if (verificationCode.length === 8) {
      const verificationData = {
        email: this.email,
        verificationCode: verificationCode
      };
      this.http.post('http://localhost:3000/check-password/verify-code', verificationData)
        .subscribe({
          next: (response) => {
            console.log('Código verificado', response);
            this.openChangePasswordModal(); // Abrir el modal de cambio de contraseña
          },
          error: (error) => console.error('Error en la verificación', error)
        });
    } else {
      console.error('El código de verificación debe tener 8 dígitos.');
    }
  }

  onSubmitPassword() {
    if (this.newPassword && this.newPassword === this.confirmPassword) {
      const passwordData = {
        email: this.email,
        newPassword: this.newPassword
      };
      this.http.post('http://localhost:3000/check-password/change-password', passwordData)
        .subscribe({
          next: (response) => {
            console.log('Contraseña cambiada', response);
            this.closeChangePasswordModal(); // Cierra el modal de cambio de contraseña
          },
          error: (error) => console.error('Error al cambiar la contraseña', error)
        });
    } else {
      console.error('Las contraseñas no coinciden.');
    }
  }
}

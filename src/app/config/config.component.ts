import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user/user.service';
import { Usuario } from '../services/user/user.models';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from 'angular-toastify';
import { ChangePasswordDialogComponent } from '../change-password-dialog-component/change-password-dialog-component.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  usuario: Usuario | null = null;
  constructor(private userService: UserService, private dialog: MatDialog,private toastService: ToastService ) {}

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(
      (data) => {
        this.usuario = data;
      },
      (error) => {
        console.error('Error al obtener el usuario:', error);
        this.toastService.error('Error al cargar la información del usuario');
      }
    );
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const { currentPassword, newPassword } = result;
        this.userService.changePassword(currentPassword, newPassword).subscribe(
          response => {
            console.log('Contraseña cambiada con éxito:', response);
            this.toastService.success('Contraseña cambiada con éxito');
          },
          error => {
            console.error('Error al cambiar la contraseña:', error);
            this.toastService.error(`Error al cambiar la contraseña: ${error.error.message}`);
          }
        );
      }
    });
  }
  editarCampo(campo:string){

  }
}

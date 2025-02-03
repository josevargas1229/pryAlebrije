import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { Usuario } from '../../services/user/user.models';// Asegúrate de que la ruta sea correcta
// Asegúrate de que esta interfaz esté definida en tu código
interface Service {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  services: Service[] = [
    {
      title: 'Política de Privacidad',
      description: 'Este apartado se encarga de editar, actualizar o eliminar las políticas de privacidad',
      icon: 'fas fa-search'
    },
    {
      title: 'Términos y Condiciones',
      description: 'Este apartado se encarga de editar, actualizar o eliminar los términos y condiciones',
      icon: 'fas fa-pencil-alt'
    },
    {
      title: 'Deslinde Legal',
      description: 'Este apartado se encarga de editar, actualizar o eliminar el deslinde legal sobre la empresa',
      icon: 'fas fa-share-alt'
    },
    {
      title: 'Perfil de la Empresa',
      description: 'Este apartado se encarga de editar, actualizar o eliminar el perfil de la empresa',
      icon: 'fas fa-mouse-pointer'
    }
  ];

  selectedService: Service | null = null;
  user: Usuario | null = null; // Variable para almacenar la información del usuario

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(
      (data) => {
        this.user = data; // Asigna la información del usuario a la variable
      },
      (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    );
  }

  showServiceDetails(service: Service): void {
    this.selectedService = service;
  }
}

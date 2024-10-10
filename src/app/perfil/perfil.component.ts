import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
interface Service {
  title: string;
  description: string;
  icon: string;
}
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports:[CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})


export class PerfilComponent {
  services: Service[] = [
    {
      title: 'Politica de Privacidad',
      description: 'Este apartado se encarga de editar,actualizar o eliminar las politicas de privacidad',
      icon: 'fas fa-search'
    },
    {
      title: 'Terminos y Condiciones',
      description: 'Este apartado se encarga de editar,actualizar o eliminar los terminos y condiciones ',
      icon: 'fas fa-pencil-alt'
    },
    {
      title: 'Deslinde Legal',
      description: 'Este apartado se encarga de editar,actualizar o eliminar el deslinde legal sobre la empresa',
      icon: 'fas fa-share-alt'
    },
    {
      title: 'Perfil de la Empresa',
      description: 'Este apartado se encarga de editar,actualizar o eliminar el perfil de la empresa',
      icon: 'fas fa-mouse-pointer'
    }
  ];

  selectedService: Service | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  showServiceDetails(service: Service): void {
    this.selectedService = service;
  }
}

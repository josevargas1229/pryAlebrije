import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-catalogo.component.html',
  styleUrl: './menu-catalogo.component.scss'
})
export class MenuCatalogoComponent {
  categorias = [
    { nombre: 'Niñas', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Niños', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Rec. Nacidos', imagen: 'assets/images/ropa.jpg'},
    { nombre: '1-3X', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'H-10', imagen: 'assets/images/ropa.jpg' },
    { nombre: '12-16', imagen: 'assets/images/ropa.jpg' },
  ];

  }

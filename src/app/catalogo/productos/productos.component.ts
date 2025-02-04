import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  searchText: string = '';

  productosDestacados = [
    { nombre: 'Vestido flores', precio: 350, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Conjunto rosa', precio: 300, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Vestido patrio', precio: 400, imagen: 'assets/images/ropa.jpg' }
  ];

  productos = [
    { nombre: 'Conjunto rosa', precio: 300, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Conjunto fiesta', precio: 280, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Vestido patrio', precio: 400, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Vestido tradicional', precio: 380, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Conjunto evento', precio: 320, imagen: 'assets/images/ropa.jpg' }
  ];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.search$.subscribe(text => {
      this.searchText = text;
    });
  }

  get filteredProductos() {
    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(this.searchText.trim().toLowerCase())
    );
  }
}

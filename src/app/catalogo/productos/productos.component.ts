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

  categorias = [
    { nombre: 'Vestidos', seleccionado: false },
    { nombre: 'Conjuntos', seleccionado: false },
    { nombre: 'Playeras', seleccionado: false }
  ];

  colores = [
    { nombre: 'Rojo', valor: '#FF0000', seleccionado: false },
    { nombre: 'Azul', valor: '#0000FF', seleccionado: false },
    { nombre: 'Verde', valor: '#00FF00', seleccionado: false },
  ];

  productosDestacados = [
    { nombre: 'Vestido flores', precio: 350, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Conjunto rosa', precio: 300, imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Vestido patrio', precio: 400, imagen: 'assets/images/ropa.jpg' }
  ];

  productos = [
    { nombre: 'Conjunto rosa', precio: 300, imagen: 'assets/images/ropa.jpg', categoria: 'Conjuntos', color: 'Rojo' },
    { nombre: 'Conjunto fiesta', precio: 280, imagen: 'assets/images/ropa.jpg', categoria: 'Conjuntos', color: 'Verde' },
    { nombre: 'Vestido patrio', precio: 400, imagen: 'assets/images/ropa.jpg', categoria: 'Vestidos', color: 'Verde' },
    { nombre: 'Vestido tradicional', precio: 380, imagen: 'assets/images/ropa.jpg', categoria: 'Vestidos', color: 'Azul' },
    { nombre: 'Conjunto evento', precio: 320, imagen: 'assets/images/ropa.jpg', categoria: 'Conjuntos', color: 'Rojo' }
  ];

  filteredProductos = [...this.productos];

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.search$.subscribe(text => {
      this.searchText = text;
      this.filtrarProductos();
    });
  }

  toggleColor(color: any): void {
    color.seleccionado = !color.seleccionado;
    this.filtrarProductos();
  }

  filtrarProductos(): void {
    const categoriasSeleccionadas = this.categorias.filter(cat => cat.seleccionado).map(cat => cat.nombre);
    const coloresSeleccionados = this.colores.filter(col => col.seleccionado).map(col => col.nombre);

    this.filteredProductos = this.productos.filter(producto => {
      const coincideCategoria = !categoriasSeleccionadas.length || categoriasSeleccionadas.includes(producto.categoria);
      const coincideColor = !coloresSeleccionados.length || coloresSeleccionados.includes(producto.color);
      const coincideBusqueda = this.searchText ? producto.nombre.toLowerCase().includes(this.searchText.toLowerCase()) : true;
      return coincideCategoria && coincideColor && coincideBusqueda;
    });
  }

  obtenerColorValor(colorNombre: string): string {
    const colorEncontrado = this.colores.find(color => color.nombre === colorNombre);
    return colorEncontrado ? colorEncontrado.valor : '#FFFFFF'; // Color por defecto (blanco) si no encuentra el color
  }

}

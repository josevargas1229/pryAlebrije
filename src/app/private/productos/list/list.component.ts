import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'categoria', 'marca', 'precio', 'stock', 'estado', 'acciones'];

  // Datos de prueba con propiedades adicionales para filtrado
  productos = [
    { id: 1, categoria_id: 1, categoria_nombre: 'Ropa', marca_id: 1, marca_nombre: 'Nike', precio: 49.99, stock: 10, estado: true },
    { id: 2, categoria_id: 2, categoria_nombre: 'Calzado', marca_id: 2, marca_nombre: 'Adidas', precio: 89.99, stock: 5, estado: false },
    { id: 3, categoria_id: 3, categoria_nombre: 'Accesorios', marca_id: 3, marca_nombre: 'Puma', precio: 29.99, stock: 20, estado: true }
  ];

  // Filtros
  filters = {
    estado: '',           // "" para todos, true o false para filtrado específico
    temporada_id: '',
    categoria_id: '',
    tipo_id: '',
    marca_id: ''
  };

  // Listas de selección (simulando backend)
  temporadas = [{ id: 1, nombre: 'Verano' }, { id: 2, nombre: 'Invierno' }];
  categorias = [{ id: 1, nombre: 'Ropa' }, { id: 2, nombre: 'Calzado' }, { id: 3, nombre: 'Accesorios' }];
  tipos = [{ id: 1, nombre: 'Casual' }, { id: 2, nombre: 'Deportivo' }];
  marcas = [{ id: 1, nombre: 'Nike' }, { id: 2, nombre: 'Adidas' }, { id: 3, nombre: 'Puma' }];

  filteredProducts = new MatTableDataSource(this.productos);

  constructor(private router: Router) { }

  ngOnInit(): void { }

  applyFilters() {
    this.filteredProducts.data = this.productos.filter(producto => {
      return (
        (this.filters.estado === '' || producto.estado === (this.filters.estado === 'true')) &&
        (this.filters.categoria_id === '' || producto.categoria_id === +this.filters.categoria_id) &&
        (this.filters.marca_id === '' || producto.marca_id === +this.filters.marca_id)
      );
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  previewProducto(id: number) {
    this.router.navigate(['/preview', id]);
  }

  editProducto(id: number) {
    this.router.navigate(['/edit', id]);
  }

  deleteProducto(id: number) {
    // Aquí podrías implementar lógica para marcar como eliminado
    console.log('Eliminar producto con ID:', id);
  }
}

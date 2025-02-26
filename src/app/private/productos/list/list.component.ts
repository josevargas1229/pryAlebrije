import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = [ 'temporada','nombre', 'precio', 'estado', 'acciones'];
  productos: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  categorias: any[] = [];
  tipos: any[] = [];
  marcas: any[] = [];
  tallas: any[] = [];
  temporadas: any[] = [];
  filters = {
    estado: '',           // "" para todos, true o false para filtrado específico
    temporada_id: '',
    categoria_id: '',
    tipo_id: '',
    marca_id: ''
  };

  filteredProducts = new MatTableDataSource(this.productos);

  constructor(private productoService: ProductoService, private router: Router) { }

  ngOnInit(): void {
    this.loadProductos();
    this.productoService.getAllFilters().subscribe({
      next: (data) => {
        this.temporadas = data.temporadas;
        this.categorias = data.categorias;
        this.tipos = data.tipos;
        this.marcas = data.marcas;
        this.tallas = data.tallas;
      },
      error: (error) => {
        console.error('Error al obtener los filtros:', error);
      }
    });
  }

  // Cargar los productos desde el backend
  loadProductos(page: number = 1): void {
    this.productoService.getAllProductos(page, this.pageSize).subscribe(response => {
      this.productos = response.productos.map(product => ({
        id: product.id,
        nombre_producto:product.nombre_producto,
        categoria_id: product.categoria_id,
        categoria_nombre: product.categoria.nombre,  // Relación con categoria
        marca_id: product.marca_id,
        marca_nombre: product.marca.nombre,  // Relación con Marca
        precio: product.precio,
        stock: product.stock,
        estado: product.estado,
        temporada_nombre: product.temporada.temporada,  // Relación con Temporada
        tipo_nombre: product.tipo.nombre  // Relación con TipoProducto
      }));
      this.filteredProducts.data = this.productos;  // Actualizar la tabla
    });
  }

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
  // Navegar a la vista de detalles del producto
  previewProducto(id: number) {
    this.router.navigate(['/admin/productos/preview', id]);
  }

  editProducto(id: number) {
    this.router.navigate(['/admin/productos/edit', id]);
  }

  deleteProducto(id: number) {
    console.log('Eliminar producto con ID:', id);
  }
}

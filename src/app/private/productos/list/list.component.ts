import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogComponent } from '../../../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private productoService: ProductoService, private router: Router, private snackBar: MatSnackBar,private dialog: MatDialog) { }

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
      console.log(response)
      this.productos = response.productos.map(product => ({
        id: product.id,
        nombre_producto:`${product.TipoProducto.nombre} ${product.Marca.nombre} ${product.Categorium.nombre}`,
        categoria_id: product.categoria_id,
        categoria_nombre: product.Categorium.nombre,  // Relación con categoria
        marca_id: product.marca_id,
        marca_nombre: product.Marca.nombre,  // Relación con Marca
        precio: product.precio,
        stock: product.stock,
        estado: product.estado,
        temporada_nombre: product.Temporada.temporada,  // Relación con Temporada
        tipo_nombre: product.TipoProducto.nombre  // Relación con TipoProducto
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
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar eliminación',
        content: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { // Si el usuario confirmó la eliminación
        this.productoService.deleteProducto(id).subscribe({
          next: () => {
            this.productos = this.productos.filter(producto => producto.id !== id);
            this.filteredProducts.data = this.productos;
  
            // Mostrar mensaje de éxito
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error al eliminar producto:', error);
  
            // Mostrar mensaje de error
            this.snackBar.open('Error al eliminar el producto', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
  
}

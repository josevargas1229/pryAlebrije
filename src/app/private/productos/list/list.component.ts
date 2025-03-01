import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../components/dialog/dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['temporada', 'nombre', 'precio', 'estado', 'acciones'];
  productos: any[] = [];
  filteredProducts = new MatTableDataSource<any>([]);
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0; // Total de productos para el paginador
  categorias: any[] = [];
  tipos: any[] = [];
  marcas: any[] = [];
  tallas: any[] = [];
  temporadas: any[] = [];

  filters = {
    estado: '',
    temporada_id: '',
    categoria_id: '',
    tipo_id: '',
    marca_id: ''
  };

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadProductos();
  }

  // Cargar filtros desde el backend
  loadFilters(): void {
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

  // Cargar productos con filtros y paginación
  loadProductos(): void {
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filters
    };

    this.productoService.getAllProductos(params).subscribe({
      next: (response) => {
        this.productos = response.productos;
        this.totalItems = response.totalItems || this.productos.length; // Ajustar si el backend devuelve totalItems
        this.filteredProducts.data = this.productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Aplicar filtros al cambiar una selección
  applyFilters(): void {
    this.currentPage = 1; // Resetear a la primera página al filtrar
    this.loadProductos();
  }

  // Manejar cambio de página
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // mat-paginator usa índice baseado en 0
    this.pageSize = event.pageSize;
    this.loadProductos();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  previewProducto(id: number): void {
    this.router.navigate(['/admin/productos/preview', id]);
  }

  editProducto(id: number): void {
    this.router.navigate(['/admin/productos/edit', id]);
  }

  deleteProducto(id: number): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar eliminación',
        content: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.productoService.deleteProducto(id).subscribe({
          next: () => {
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadProductos(); // Recargar la lista tras eliminar
          },
          error: (error) => {
            console.error('Error al eliminar producto:', error);
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
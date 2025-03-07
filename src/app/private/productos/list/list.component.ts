import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../components/dialog/dialog.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

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
  totalItems: number = 0;
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

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Referencia al paginador

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Leer parámetros de la URL al iniciar
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      this.filters.estado = params['estado'] || '';
      this.filters.temporada_id = params['temporada_id'] || '';
      this.filters.categoria_id = params['categoria_id'] || '';
      this.filters.tipo_id = params['tipo_id'] || '';
      this.filters.marca_id = params['marca_id'] || '';

      // Sincronizar el paginador después de cargar los parámetros
      if (this.paginator) {
        this.paginator.pageIndex = this.currentPage - 1; // pageIndex es 0-based
        this.paginator.pageSize = this.pageSize;
      }
    });

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
        this.totalItems = response.totalItems || this.productos.length;
        this.filteredProducts.data = this.productos;

        // Sincronizar el paginador con los datos cargados
        if (this.paginator) {
          this.paginator.pageIndex = this.currentPage - 1; // pageIndex es 0-based
          this.paginator.pageSize = this.pageSize;
          this.paginator.length = this.totalItems;
        }

        this.updateUrlParams();
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

  // Actualizar los parámetros de la URL
  updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        estado: this.filters.estado || null,
        temporada_id: this.filters.temporada_id || null,
        categoria_id: this.filters.categoria_id || null,
        tipo_id: this.filters.tipo_id || null,
        marca_id: this.filters.marca_id || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Aplicar filtros al cambiar una selección
  applyFilters(): void {
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0; // Resetear el paginador a la primera página
    }
    this.loadProductos();
  }

  // Manejar cambio de página
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProductos();
  }

  navigateTo(path: string): void {
    this.router.navigate([path], {
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        estado: this.filters.estado || null,
        temporada_id: this.filters.temporada_id || null,
        categoria_id: this.filters.categoria_id || null,
        tipo_id: this.filters.tipo_id || null,
        marca_id: this.filters.marca_id || null
      }
    });
  }

  previewProducto(id: number): void {
    this.router.navigate(['/admin/productos/preview', id], {
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        estado: this.filters.estado || null,
        temporada_id: this.filters.temporada_id || null,
        categoria_id: this.filters.categoria_id || null,
        tipo_id: this.filters.tipo_id || null,
        marca_id: this.filters.marca_id || null
      }
    });
  }

  editProducto(id: number): void {
    this.router.navigate(['/admin/productos/edit', id], {
      queryParams: {
        page: this.currentPage,
        pageSize: this.pageSize,
        estado: this.filters.estado || null,
        temporada_id: this.filters.temporada_id || null,
        categoria_id: this.filters.categoria_id || null,
        tipo_id: this.filters.tipo_id || null,
        marca_id: this.filters.marca_id || null
      }
    });
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
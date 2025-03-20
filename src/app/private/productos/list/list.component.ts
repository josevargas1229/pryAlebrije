import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../components/dialog/dialog.component';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('containerFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100px) scale(0.8)' }),
        animate('1000ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('headerBounce', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('800ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'translateY(-50px)', offset: 0 }),
          style({ opacity: 0.5, transform: 'translateY(20px)', offset: 0.5 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1 }),
        ])),
      ]),
    ]),
    trigger('filterSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-200px)' }),
        animate('600ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('tableFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) rotateX(-10deg)' }),
        animate('900ms ease-out', style({ opacity: 1, transform: 'scale(1) rotateX(0deg)' })),
      ]),
    ]),
    trigger('rowEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(150px) skewX(-15deg)' }),
        animate('700ms 300ms ease-out', style({ opacity: 1, transform: 'translateX(0) skewX(0deg)' })),
      ]),
    ]),
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' })),
      state('hover', style({ transform: 'scale(1.3) rotate(360deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' })),
      transition('normal <=> hover', animate('400ms ease-in-out')),
    ]),
    trigger('paginatorPop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.7)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('emptyState', [
      state('void', style({ opacity: 0, transform: 'scale(0.5) rotate(-20deg)' })),
      state('*', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      transition('void => *', [
        animate('1200ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.5) rotate(-20deg)', offset: 0 }),
          style({ opacity: 0.6, transform: 'scale(1.4) rotate(15deg)', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 }),
        ])),
      ]),
    ]),
  ]
})
export class ListComponent implements OnInit, AfterViewInit {
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
  isLoading: boolean = true;

  filters = {
    estado: '',
    temporada_id: '',
    categoria_id: '',
    tipo_id: '',
    marca_id: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Referencia al paginador

  constructor(
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Leer parámetros de la URL al iniciar
    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.pageSize = params['pageSize'] ? +params['pageSize'] : 10;
      this.filters.estado = params['estado'] === '1' ? '1' : params['estado'] === '0' ? '0' : '';
      this.filters.temporada_id = params['temporada_id'] ? params['temporada_id'] : '';
      this.filters.categoria_id = params['categoria_id'] ? params['categoria_id'] : '';
      this.filters.tipo_id = params['tipo_id'] ? params['tipo_id'] : '';
      this.filters.marca_id = params['marca_id'] ? params['marca_id'] : '';

      // Sincronizar el paginador después de cargar los parámetros
      if (this.paginator) {
        this.paginator.pageIndex = this.currentPage - 1; // pageIndex es 0-based
        this.paginator.pageSize = this.pageSize;
      }
    });

    this.loadFilters();
    this.loadProductos();
  }
  ngAfterViewInit(): void {
    // Inicializar el paginador con valores actuales, si ya están disponibles
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
    }
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

  loadProductos(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      // Convertir valores únicos en arreglos de un solo elemento
      estado: this.filters.estado === '1' ? true : this.filters.estado === '0' ? false : undefined,
      temporada_id: this.filters.temporada_id ? [this.filters.temporada_id] : [],
      categoria_id: this.filters.categoria_id ? [this.filters.categoria_id] : [],
      tipo_id: this.filters.tipo_id ? [this.filters.tipo_id] : [],
      marca_id: this.filters.marca_id ? [this.filters.marca_id] : [],
      talla_id: [],
      color_id: []
    };
  console.log('Params:', params);
    this.productoService.getAllProductos(params).subscribe({
      next: (response) => {
        this.productos = response.productos || [];
        this.totalItems = response.totalItems || this.productos.length;
        this.filteredProducts.data = this.productos;
  
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = (response.currentPage || this.currentPage) - 1;
          this.paginator.pageSize = response.pageSize || this.pageSize;
        }
  
        this.updateUrlParams();
        this.isLoading = false;
  
        console.log('Page:', this.currentPage, 'Index:', this.paginator?.pageIndex, 'Total:', this.totalItems);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

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

  applyFilters(): void {
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadProductos();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // pageIndex es 0-based, currentPage es 1-based
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
    this.navigateTo(`/admin/productos/preview/${id}`);
  }

  editProducto(id: number): void {
    this.navigateTo(`/admin/productos/edit/${id}`);
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
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadProductos();
          },
          error: (error) => {
            console.error('Error al eliminar producto:', error);
            this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  buttonStates: { [key: number]: { [action: string]: string } } = {};
  onButtonHover(productoId: number, action: string, isHover: boolean): void {
    if (!this.buttonStates[productoId]) {
      this.buttonStates[productoId] = {};
    }
    this.buttonStates[productoId][action] = isHover ? 'hover' : 'normal';
  }

  getButtonState(productoId: number, action: string): string {
    return this.buttonStates[productoId]?.[action] || 'normal';
  }
}
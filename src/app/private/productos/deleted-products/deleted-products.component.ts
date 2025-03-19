import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-deleted-products',
  templateUrl: './deleted-products.component.html',
  styleUrls: ['./deleted-products.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px) scale(0.9)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('emptyState', [
      state('void', style({ opacity: 0, transform: 'scale(0.5) rotate(-15deg)' })),
      state('*', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      transition('void => *', [
        animate('1200ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.5) rotate(-15deg)', offset: 0 }),
          style({ opacity: 0.6, transform: 'scale(1.3) rotate(10deg)', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 }),
        ])),
      ]),
    ]),
    trigger('rowEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100px) skewX(-20deg)' }),
        animate('700ms 300ms ease-out', style({ opacity: 1, transform: 'translateX(0) skewX(0deg)' })),
      ]),
    ]),
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' })),
      state('hover', style({ transform: 'scale(1.2) rotate(360deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' })),
      transition('normal <=> hover', animate('400ms ease-in-out')),
    ]),
    trigger('paginatorFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ]
})
export class DeletedProductsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'precio', 'deleted_at', 'actions'];
  dataSource = new MatTableDataSource<any>();
  isLoading: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly productoService: ProductoService,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDeletedProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1; // pageIndex es 0-based
      this.paginator.pageSize = this.pageSize;
    }
  }

  loadDeletedProducts(page: number = 1, pageSize: number = 10) {
    this.isLoading = true;
    this.productoService.getDeletedProductos(page, pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.productos || [];
        this.totalItems = response.total || this.dataSource.data.length;
        if (this.paginator) {
          this.paginator.pageIndex = this.currentPage - 1; // pageIndex es 0-based
          this.paginator.pageSize = this.pageSize;
          this.paginator.length = this.totalItems;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showSnackBar('Error al cargar productos eliminados');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  restoreProduct(id: number) {
    if (confirm('¿Estás seguro de que quieres restaurar este producto?')) {
      this.productoService.restoreProducto(id).subscribe({
        next: () => {
          this.showSnackBar('Producto restaurado exitosamente');
          this.loadDeletedProducts(this.paginator.pageIndex + 1, this.paginator.pageSize);
        },
        error: (error) => {
          this.showSnackBar('Error al restaurar el producto');
          console.error(error);
        }
      });
    }
  }

  onPageChange(event: PageEvent) {
    this.loadDeletedProducts(event.pageIndex + 1, event.pageSize);
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getButtonState(elementId: number): string {
    return this.buttonStates[elementId] || 'normal';
  }

  buttonStates: { [key: number]: string } = {};
  onButtonHover(elementId: number, isHover: boolean): void {
    this.buttonStates[elementId] = isHover ? 'hover' : 'normal';
  }
}
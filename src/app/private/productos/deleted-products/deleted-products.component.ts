import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-deleted-products',
  templateUrl: './deleted-products.component.html',
  styleUrls: ['./deleted-products.component.scss']
})
export class DeletedProductsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre','precio', 'deleted_at', 'actions'];
  dataSource = new MatTableDataSource<any>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productoService: ProductoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDeletedProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadDeletedProducts(page: number = 1, pageSize: number = 10) {
    this.productoService.getDeletedProductos(page, pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.productos || response; 
        if (response.total) {
          this.paginator.length = response.total;
        }
      },
      error: (error) => {
        this.showSnackBar('Error al cargar productos eliminados');
        console.error(error);
      }
    });
  }

  restoreProduct(id: number) {
    if (confirm('¿Estás seguro de que quieres restaurar este producto?')) {
      this.productoService.restoreProducto(id).subscribe({
        next: () => {
          this.showSnackBar('Producto restaurado exitosamente');
          this.loadDeletedProducts(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
          );
        },
        error: (error) => {
          this.showSnackBar('Error al restaurar el producto');
          console.error(error);
        }
      });
    }
  }

  onPageChange(event: any) {
    this.loadDeletedProducts(event.pageIndex + 1, event.pageSize);
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
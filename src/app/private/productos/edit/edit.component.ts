import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  productoExistente: any = {};
  productoId!: number;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productoId = +id;
        this.cargarProducto(this.productoId);
      }
    });
  }

  cargarProducto(id: number) {
    this.productoService.getProductoById(id).subscribe({
      next: (response) => {
        this.productoExistente = response.producto;
        console.table(this.productoExistente);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.snackBar.open('Error al cargar el producto', 'Cerrar', { duration: 3000 });
      }
    });
  }

  actualizarProducto(datos: FormData) {
    this.isLoading = true;
    this.productoService.updateProducto(this.productoId, datos).subscribe({
      next: () => {
        this.snackBar.open('Producto actualizado con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/productos/list']);
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 3000 });
      }
    }).add(() => {
      this.isLoading = false;
    });
  }

  cancelar() {
    this.router.navigate(['/admin/productos/list']);
  }
}
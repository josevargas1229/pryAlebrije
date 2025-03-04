import { Component } from '@angular/core';
import { ProductoService } from '../services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {
  isLoading = false;
  constructor(
    private productoService: ProductoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  guardarProducto(datos: FormData) {
    console.log('Añadiendo producto...', datos);
    
    // No conviertas FormData a objeto, déjalo como está
    this.isLoading = true;
    
    this.productoService.createProducto(datos).subscribe(
      response => {
        console.log('Producto creado con éxito:', response);
        this.snackBar.open('Producto creado con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/admin/productos/list']);
      },
      error => {
        console.error('Error al crear producto:', error);
        this.snackBar.open('Error al crear el producto', 'Cerrar', { duration: 3000 });
      }
    ).add(() => {
      this.isLoading = false;
    });
  }
  
  cancelar() {
    console.log('Cancelando añadir...');
    this.router.navigate(['/admin/productos/list']);
  }
}

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
  
    // Convertir FormData a un objeto JSON
    const producto: any = {};
    datos.forEach((value, key) => {
      producto[key] = value;
    });
  
    console.log('Producto:', producto);
    this.isLoading = true;
    // Llamar al servicio para crear el producto con el objeto JSON
    this.productoService.createProducto(producto).subscribe(
      response => {
        console.log('Producto creado con éxito:', response);
        
        // Mostrar snackbar de éxito
        this.snackBar.open('Producto creado con éxito', 'Cerrar', {
          duration: 3000
        });
        
        // Redireccionar a la lista de productos
        this.router.navigate(['/admin/productos/list']);
      },
      error => {
        console.error('Error al crear producto:', error);
      }
    ).add(() => {
      this.isLoading = false; // Desactivar el estado de carga cuando termine la petición
    });
  }
  
  cancelar() {
    console.log('Cancelando añadir...');
    this.router.navigate(['/admin/productos/list']);
  }
}

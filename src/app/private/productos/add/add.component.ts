import { Component } from '@angular/core';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent{
  constructor(private productoService: ProductoService) {}

  guardarProducto(datos: FormData) {
    console.log('Añadiendo producto...', datos);
  
    // Convertir FormData a un objeto JSON
    const producto: any = {};
    datos.forEach((value, key) => {
      producto[key] = value;
    });
  
    console.log('Producto:', producto);
  
    // Llamar al servicio para crear el producto con el objeto JSON
    this.productoService.createProducto(producto).subscribe(
      response => {
        console.log('Producto creado con éxito:', response);
      },
      error => {
        console.error('Error al crear producto:', error);
      }
    );
  }
  
  
  cancelar() {
    console.log('Cancelando añadir...');
    // Aquí puedes cerrar el diálogo o navegar a otra página
  }
}

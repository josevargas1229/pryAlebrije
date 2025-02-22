import { Component } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  productoExistente:  null = null;
  actualizarProducto(datos: FormData) {
    console.log('Actualizando producto...', datos);
  }
  cancelar() {
    console.log('Cancelando edición...');
    // Aquí puedes cerrar el diálogo o navegar a otra página
  }
}

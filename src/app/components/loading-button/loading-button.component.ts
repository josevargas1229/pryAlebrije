import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss'
})
export class LoadingButtonComponent {
  @Input() text: string = 'Submit'; // Texto del botón
  @Input() loading: boolean = false; // Estado de carga
  @Input() disabled: boolean = false; // Estado deshabilitado
  @Input() color: string = 'primary'; // Color del botón
  @Input() type: string = 'button'; // Tipo de botón (submit, button, etc.)
}

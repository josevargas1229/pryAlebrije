import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RuletaComponent } from '../components/ruleta/ruleta.component';

@Component({
  standalone: true,
  selector: 'app-ruleta-modal',
  imports: [CommonModule, MatDialogModule, RuletaComponent],
  templateUrl: './ruleta-modal.component.html',
  styleUrls: ['./ruleta-modal.component.scss']
})
export class RuletaModalComponent {
  private dialogRef = inject(MatDialogRef<RuletaModalComponent>);
  // solo UI (puedes cambiar etiquetas/colores)
  segs = [
    { label: '10%', color:'#5B8DEF', porcentaje:20 },
    { label: '¡GRATIS!', color:'#FFC857', porcentaje:10 },
    { label: '5%',  color:'#7DCFB6', porcentaje:25 },
    { label: 'Suerte', color:'#E9724C', porcentaje:15 },
    { label: '2%',  color:'#7E6BC4', porcentaje:30 }
  ];
  close() { this.dialogRef.close(); }
}

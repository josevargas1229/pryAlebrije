import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-reglas-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './reglas-modal.component.html',
  styleUrl: './reglas-modal.component.scss'
})
export class ReglasModalComponent {
dialogRef = inject(MatDialogRef<ReglasModalComponent>);
}

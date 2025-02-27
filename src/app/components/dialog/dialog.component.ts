import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Input() data: any = {};
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: any
  ) {
    // Si no se pasa data como @Input, usa la que viene del MatDialog
    if (!this.data.title && this.injectedData) {
      this.data = this.injectedData;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(formValue?: any): void {
    this.dialogRef.close(formValue !== undefined ? formValue : true);
  }
  
}

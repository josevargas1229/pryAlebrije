import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

interface PremioData {
  premio?: string;
  cupon?: string;
  mensaje?: string;
  tipo: 'success' | 'info';
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-premio-modal',
  templateUrl: './premio-modal.component.html',
  styleUrls: ['./premio-modal.component.scss']
})
export class PremioModalComponent implements OnInit, OnDestroy {
  data = inject(MAT_DIALOG_DATA) as PremioData;
  private dialogRef = inject(MatDialogRef<PremioModalComponent>);

  confettiPieces: Array<{
    left: number;
    animationDelay: number;
    backgroundColor: string;
  }> = [];
  copiado = false;

  ngOnInit() {
    if (this.data.tipo === 'success') {
      this.createConfetti();
    }
  }

  ngOnDestroy() {
    this.confettiPieces = [];
  }

  createConfetti() {
    const colors = ['#C6613F', '#191B31', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'];
    for (let i = 0; i < 50; i++) {
      this.confettiPieces.push({
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  copiarCupon() {
    if (this.data.cupon) {
      navigator.clipboard.writeText(this.data.cupon);
      this.copiado = true;
      setTimeout(() => {
        this.copiado = false;
      }, 2000);
    }
  }
}
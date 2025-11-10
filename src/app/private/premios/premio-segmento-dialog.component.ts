import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Premio, SegmentoRuletaDTO } from './models';
import { RuletaPremiosAdminService } from './ruleta-premios-admin.service';

export interface PremioSegmentoDialogData {
  title: string;
  premios: Premio[];
  segmentos: SegmentoRuletaDTO[];
  ruletaId: number;
  segmento: SegmentoRuletaDTO | null;
}

@Component({
  selector: 'app-premio-segmento-dialog',
  templateUrl: './premio-segmento-dialog.component.html',
  styleUrls: ['./premio-segmento-dialog.component.scss']
})
export class PremioSegmentoDialogComponent {
  premio_id: number | null = null;
  probabilidad_pct = 0;
  activo = true;
  error = '';

  constructor(
    private dialogRef: MatDialogRef<PremioSegmentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PremioSegmentoDialogData,
    private ruletaSrv: RuletaPremiosAdminService
  ) {
    if (data.segmento) {
      this.premio_id = data.segmento.premio_id;
      this.probabilidad_pct = Number(data.segmento.probabilidad_pct);
      this.activo = data.segmento.activo;
    }
  }

  guardar(): void {
    this.error = '';

    if (!this.premio_id) {
      this.error = 'Selecciona un premio.';
      return;
    }

    if (this.probabilidad_pct <= 0 || this.probabilidad_pct > 100) {
      this.error = 'Probabilidad debe estar entre 0 y 100.';
      return;
    }

    // suma actual de probabilidades activas, sin contar el segmento editado
    const current = this.data.segmentos
      .filter(s => s.activo && (!this.data.segmento || s.id !== this.data.segmento.id))
      .reduce((acc, s) => acc + Number(s.probabilidad_pct || 0), 0);

    const total = current + (this.activo ? this.probabilidad_pct : 0);
    if (total > 100 + 1e-6) {
      this.error = `La suma de probabilidades activas sería ${total}%. Debe ser ≤ 100%.`;
      return;
    }

    if (this.data.segmento) {
      // EDITAR
      this.ruletaSrv.updateSegmento(this.data.ruletaId, this.data.segmento.id, {
        probabilidad_pct: this.probabilidad_pct,
        activo: this.activo
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: e => { this.error = e?.error?.message || 'Error al actualizar segmento.'; }
      });
    } else {
      // CREAR
      this.ruletaSrv.createSegmento(this.data.ruletaId, {
        premio_id: this.premio_id,
        probabilidad_pct: this.probabilidad_pct,
        activo: this.activo
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: e => { this.error = e?.error?.message || 'Error al crear segmento.'; }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}

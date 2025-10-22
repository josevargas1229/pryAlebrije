import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RuletaComponent, RuletaSegmento } from '../components/ruleta/ruleta.component';
import { RuletaService, SegmentoDTO, SpinResp } from '../services/ruleta/ruleta.service';
import { AuthService } from '../services/auth/auth.service'; // <-- tu auth
import { ToastService } from 'angular-toastify';

@Component({
  standalone: true,
  selector: 'app-ruleta-modal',
  imports: [CommonModule, MatDialogModule, RuletaComponent],
  templateUrl: './ruleta-modal.component.html',
  styleUrls: ['./ruleta-modal.component.scss']
})
export class RuletaModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RuletaModalComponent>);
  private api = inject(RuletaService);
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild(RuletaComponent) wheel!: RuletaComponent;
  intentosDisponibles: number | null = null;
  intentosCargando = false;
  ruletaId = 1;
  cargando = true;
  error = '';
  segmentos: RuletaSegmento[] = [];
  isLogged = false;
  alertMsg: string | null = null;
  alertType: 'success' | 'info' | 'error' | null = null;


  async ngOnInit() {

    try {
      const res = await this.auth.checkAuthStatus();
      this.isLogged = !!res?.isValid;
    } catch { this.isLogged = false; }

    this.loadSegs();

    this.loadIntentos();
  }

  close() { this.dialogRef.close(); }

   private loadIntentos() {
    this.intentosCargando = true;
    this.api.getIntentosDisponibles().subscribe({
      next: (r) => {
        // 200 OK → hay sesión
        this.isLogged = true;
        this.intentosDisponibles = Number(r?.disponibles ?? 0);
        this.intentosCargando = false;
      },
      error: (e) => {
        // 401: no logueado → muestra mensaje de login
        if (e?.status === 401) {
          this.isLogged = false;
          this.intentosDisponibles = null; // para que no muestre "0" como si fuera sin intentos
          this.intentosCargando = false;
          return;
        }
        // 403: logueado pero sin intentos → muestra "0"
        if (e?.status === 403) {
          this.isLogged = true;
          this.intentosDisponibles = 0;
          this.intentosCargando = false;
          return;
        }

        this.intentosDisponibles = 0;
        this.intentosCargando = false;
      }
    });
  }


  private loadSegs() {
  this.cargando = true; this.error = '';
  this.api.getSegmentos(this.ruletaId).subscribe({
    next: (rows) => {
      this.segmentos = this.mapSegs(rows);
      if (!this.segmentos.length) {
        this.segmentos = [
          { label: 'Descuento 10%', porcentaje: 30, color: '#5B8DEF' } as any,
          { label: 'Descuento 5%',  porcentaje: 40, color: '#7DCFB6' } as any,
          { label: 'Sin Premio',    porcentaje: 30, color: '#FFC857' } as any,
        ];
        this.error = 'No hay segmentos configurados para esta ruleta.';
      }
      this.cargando = false;
    },
    error: (e) => {
      this.cargando = false;
      this.error = (e as any)?.error?.message || (e as any).message || 'Error al cargar segmentos.';
    }
  });
}


  onSpin() {
  if (this.cargando || !this.segmentos.length || this.wheel.spinning()) return;

  // limpiar alerta SOLO al iniciar un nuevo giro
  this.alertMsg = null;
  this.alertType = null;

  this.api.spin(this.ruletaId).subscribe({
    next: (resp) => {
 const ganadorId = resp.premio?.id ?? null;
const seg = this.segmentos.find(s => (s as any).premioId == ganadorId);
const center = seg ? this.centerDeg(seg) : null;

if (center != null && (this.wheel as any).spinToSegment) {
  // pequeño epsilon para no caer justo en el borde
  this.wheel.spinToSegment((center + 0.1) % 360);
} else {
  this.wheel.spinDemo();
}
  if (resp.resultado === 'gano_premio') {
    const cup = resp.cupon ? ` — Cupón: ${resp.cupon.codigo}` : '';
    this.showAlert(`🎉 ¡Ganaste ${resp.premio?.nombre}!${cup}`, 'success');
  } else {
    this.showAlert('Sin premio. ¡Sigue intentando!', 'info');
  }

  // opcional: refrescar intentos
  this.loadIntentos();
},
    error: (e: any) => {
      const status = e?.status;
      const msg = e?.error?.message || e?.error?.error || e?.message || 'Error al procesar el giro.';

      if (status === 401) {
        this.showAlert('Debes iniciar sesión para girar la ruleta.', 'info');
        setTimeout(() => { this.close(); setTimeout(() => this.router.navigate(['/login']), 300); }, 1500);
        return;
      }
      if (status === 403) { this.showAlert(msg, 'info'); return; }
      this.showAlert(msg, 'error');
    }
  });
}



showAlert(message: string, type: 'success' | 'info' | 'error') {
  this.alertMsg = message;
  this.alertType = type;
}



  private mapSegs(rows: SegmentoDTO[]): RuletaSegmento[] {
  return rows.map(r => ({
    label: r.premio?.nombre ?? 'Sin premio',
    porcentaje: Number(r.probabilidad_pct ?? 0),
    premioId: r.premio?.id ?? r.premio_id ?? null
  }) as any);
}


  private centerDeg(seg: RuletaSegmento): number {
    const segs = this.segmentos;
    const total = Math.max(1, segs.reduce((s, x) => s + (x.porcentaje ?? 0), 0));
    let acc = 0;
    for (const s of segs) {
      const pct = s.porcentaje ?? (100 / segs.length);
      const ang = (pct / total) * 360;
      const start = acc; const end = acc + ang; acc += ang;
      if (s === seg) return (start + end) / 2;
    }
    return 0;
  }
}

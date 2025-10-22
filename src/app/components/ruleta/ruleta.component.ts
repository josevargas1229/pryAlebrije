import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RuletaSegmento = {
  label: string;
  color?: string;
  porcentaje?: number;
  premioId?: number | null;  // ✅ Agregado
};

type DrawSeg = RuletaSegmento & { start: number; end: number; fill: string };

@Component({
  standalone: true,
  selector: 'app-ruleta',
  imports: [CommonModule],
  templateUrl: './ruleta.component.html',
  styleUrls: ['./ruleta.component.scss'],
})
export class RuletaComponent {
  @Input() size = 360;
  @Input() segmentos: RuletaSegmento[] = [
    { label: '10%', color: '#FF6B6B', porcentaje: 20 },
    { label: '¡GRATIS!', color: '#FFC857', porcentaje: 10 },
    { label: '5%', color: '#4ECDC4', porcentaje: 25 },
    { label: 'Suerte', color: '#FF8C42', porcentaje: 15 },
    { label: '2%', color: '#A78BFA', porcentaje: 30 },
  ];
  @Input() externalControl = false;                    // ⬅️ nuevo
  @Output() spinClick = new EventEmitter<void>();      // ⬅️ nuevo
  @Input() disabled = false;


  readonly spinning = signal(false);
  readonly angle = signal(0);
  readonly live = signal('');

 drawSegs(): DrawSeg[] {
  const segs = this.segmentos ?? [];
  if (!segs.length) return [];

  // Coerción numérica robusta
  const pesos = segs.map(s => {
    const v = Number((s as any).porcentaje);
    return Number.isFinite(v) && v > 0 ? v : 0;
  });
  const tiene = pesos.some(v => v > 0);
  const usados = tiene ? pesos : segs.map(() => 100 / segs.length);
  const suma = usados.reduce((a, b) => a + b, 0) || 1;

  const palette = ['#FF6B6B','#4ECDC4','#FFC857','#FF8C42','#A78BFA','#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6'];
  let acc = 0;
  return segs.map((s, i) => {
    const ang = (usados[i] / suma) * 360;
    const start = acc, end = acc + ang; acc = end;
    return { ...(s as any), start, end, fill: (s as any).color || palette[i % palette.length] } as DrawSeg;
  });
}


  spinDemo() {
    if (this.spinning()) return;
    this.spinning.set(true);
    const current = this.angle() % 360;
    const extraSpins = 8 * 360;
    const randomStop = Math.floor(Math.random() * 360);
    let delta = (randomStop - (current % 360));
    delta = (delta + 360) % 360;
    const target = this.angle() + extraSpins + delta;
    this.angle.set(target);
    this.live.set('Girando…');
    setTimeout(() => { this.spinning.set(false); this.live.set('¡Resultado listo!'); setTimeout(() => this.live.set(''), 1500); }, 3500);
  }

  // ⬅️ nuevo: giro controlado hacia el centro (grados) de un segmento
  spinToSegment(centerDeg: number) {
    this.spinning.set(true);
    const current = this.angle() % 360;
    const extra = 6 * 360;
    let delta = (360 - centerDeg - (current % 360));
    delta = (delta + 360) % 360;
    this.angle.set(this.angle() + extra + delta);
    setTimeout(() => this.spinning.set(false), 1800);
  }

  // ⬅️ nuevo: delega el click al padre si es control externo
  onWheelClick() {
    if (this.disabled || this.spinning()) return;
    if (this.externalControl) {
      if (!this.spinning()) this.spinClick.emit();
    } else {
      this.spinDemo();
    }
  }

  pathFor(seg: DrawSeg) {
    const r = 48, cx = 50, cy = 50;
    const a0 = (seg.start - 90) * Math.PI / 180;
    const a1 = (seg.end - 90) * Math.PI / 180;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const largeArc = (seg.end - seg.start) > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1} Z`;
  }

  getLabelTransform(seg: DrawSeg) {
    const midAngle = (seg.start + seg.end) / 2;
    return `translate(50 50) rotate(${midAngle}) translate(0 -32)`;
  }

  transformStyle() { return { transform: `rotate(${this.angle()}deg)` }; }
}

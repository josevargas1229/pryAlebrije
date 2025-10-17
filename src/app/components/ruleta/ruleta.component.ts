import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RuletaSegmento = { label: string; color?: string; porcentaje?: number };

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

  readonly spinning = signal(false);
  readonly angle = signal(0);
  readonly live = signal('');

  readonly drawSegs = computed<DrawSeg[]>(() => {
    const segs = this.segmentos;
    if (!segs.length) return [];
    const total = Math.max(
      1,
      segs.reduce((s, x) => s + (x.porcentaje ?? 100 / segs.length), 0)
    );
    const palette = [
      '#FF6B6B', '#4ECDC4', '#FFC857', '#FF8C42', '#A78BFA',
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'
    ];
    let acc = 0;
    return segs.map((s, i) => {
      const pct = s.porcentaje ?? (100 / segs.length);
      const ang = (pct / total) * 360;
      const start = acc;
      const end = acc + ang;
      acc += ang;
      return { ...s, start, end, fill: s.color || palette[i % palette.length] };
    });
  });

  spinDemo() {
    if (this.spinning()) return;
    this.spinning.set(true);
    const current = this.angle() % 360;
    const extraSpins = 8 * 360; // Más vueltas para efecto dramático
    const randomStop = Math.floor(Math.random() * 360);
    let delta = (randomStop - (current % 360));
    delta = (delta + 360) % 360;
    const target = this.angle() + extraSpins + delta;
    this.angle.set(target);
    this.live.set('Girando…');
    setTimeout(() => {
      this.spinning.set(false);
      this.live.set('¡Resultado listo!');
      setTimeout(() => this.live.set(''), 1500);
    }, 3500); // Sincronizado con duración CSS
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

  transformStyle() {
    return { transform: `rotate(${this.angle()}deg)` };
  }
}

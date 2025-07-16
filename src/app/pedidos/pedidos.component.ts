// pedidos.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VentaService, Venta } from '../services/ventas/venta.service';
import { AuthService } from '../services/auth/auth.service';

import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {
  pedidos: Venta[] = [];
  isLoading: boolean = true;
  usuarioId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.usuarioId = user.userId || null;
            if (this.usuarioId) this.cargarPedidos();
            else this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        },
        error: () => this.isLoading = false
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPedidos(): void {
    if (!this.usuarioId) return;
    this.isLoading = true;
    this.ventaService.getVentasByUsuario(this.usuarioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ventas) => {
          this.pedidos = ventas.map(v => ({
            ...v,
            detalles: v.detalles.map(d => ({
              ...d,
              talla: d.talla || { talla: 'Sin talla' },
              color: d.color || { color: 'Sin color', colorHex: '#F0F0F0' }
            }))
          })).sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime());
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
  }

  verProductoDetalle(id: number): void {
    this.router.navigate([`/menu-catalogo/productos/producto-detalle/${id}`]);
  }

  irACatalogo(): void {
    this.router.navigate(['/menu-catalogo']);
  }

  trackByPedidoId(_: number, p: Venta): number {
    return p.id;
  }

  trackByDetalleId(i: number, d: any): number {
    return d.id || i;
  }

  getTotalGastado(): number {
    return this.pedidos.reduce((sum, p) => sum + p.total, 0);
  }

  getTotalProductos(p: Venta): number {
    return p.detalles?.reduce((sum, d) => sum + d.cantidad, 0) || 0;
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'procesando':
      case 'en_proceso': return 'estado-procesando';
      case 'completado':
      case 'entregado': return 'estado-completado';
      case 'cancelado': return 'estado-cancelado';
      default: return 'estado-pendiente';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'schedule';
      case 'procesando':
      case 'en_proceso': return 'autorenew';
      case 'completado':
      case 'entregado': return 'check_circle';
      case 'cancelado': return 'cancel';
      default: return 'schedule';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'procesando': return 'Procesando';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return 'Pendiente';
    }
  }

  refrescarPedidos(): void {
    this.cargarPedidos();
  }

  formatearFecha(fecha: string): string {
    const f = new Date(fecha);
    const ahora = new Date();
    const dias = Math.floor((ahora.getTime() - f.getTime()) / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return f.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return '#FF9800';
      case 'procesando':
      case 'en_proceso': return '#2196F3';
      case 'completado':
      case 'entregado': return '#4CAF50';
      case 'cancelado': return '#F44336';
      default: return '#9E9E9E';
    }
  }
}

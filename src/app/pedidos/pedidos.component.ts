import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VentaService, Venta } from '../services/ventas/venta.service';
import { AuthService } from '../services/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatProgressSpinnerModule, MatIconModule, MatAccordion, MatExpansionModule ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit {
  pedidos: Venta[] = [];
  isLoading: boolean = true;
  usuarioId: number | null = null;

  constructor(private ventaService: VentaService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log(" Obteniendo usuario autenticado...");

    this.authService.currentUser.subscribe(user => {
      console.log(" Usuario autenticado recibido:", user);

      if (user) {
        this.usuarioId = user?.userId || null;
        console.log("ID del usuario:", this.usuarioId);

        if (this.usuarioId) {
          this.cargarPedidos();
        }
      } else {
        console.warn(" No se recibió usuario autenticado.");
        this.isLoading = false;
      }
    });
  }

  verProductoDetalle(productoId: number): void {
    this.router.navigate([`/menu-catalogo/productos/producto-detalle/${productoId}`]);
  }

  cargarPedidos(): void {
    if (!this.usuarioId) {
      console.warn("Intento de cargar pedidos sin usuarioId.");
      return;
    }

    this.ventaService.getVentasByUsuario(this.usuarioId).subscribe({
      next: ventas => {
        console.log("Pedidos obtenidos en el componente:", ventas);

        this.pedidos = ventas.map(venta => ({
          ...venta,
          detalles: venta.detalles.map(detalle => ({
            ...detalle,
            talla: detalle.talla || { talla: 'Sin talla' },
            color: detalle.color || { color: 'Sin color', colorHex: '#FFFFFF' },
          }))
        }));
      },
      error: error => console.error('Error al obtener pedidos:', error)
    });
  }
}

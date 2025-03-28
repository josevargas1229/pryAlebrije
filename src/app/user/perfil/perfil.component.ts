import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { Usuario } from '../../services/user/user.models';// Asegúrate de que la ruta sea correcta
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { VentaService, Venta } from '../../services/ventas/venta.service';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule,MatDividerModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {

  user: Usuario | null = null; // Variable para almacenar la información del usuario
  pedidos: Venta[] = []; // Pedidos del usuario
  usuarioId: number | null = null;

  constructor(
    private userService: UserService,
    private ventaService: VentaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log("Obteniendo usuario autenticado desde authService...");

    this.authService.currentUser.subscribe(user => {
      console.log("Usuario autenticado recibido en perfil:", user);

      if (user) {
        this.usuarioId = user?.userId || null; // ✅ Corregido para usar `userId`
        console.log("ID del usuario:", this.usuarioId);

        if (this.usuarioId) {
          this.cargarPedidos();
        }
      } else {
        console.warn("⚠️ No se recibió usuario autenticado, no se cargarán pedidos.");
      }
    });

    this.userService.getUserInfo().subscribe(
      data => {
        console.log("✅ Datos del usuario obtenidos desde el backend:", data);
        this.user = data;
      },
      error => console.error('❌ Error al obtener el usuario:', error)
    );
  }



  cargarPedidos(): void {
    if (!this.usuarioId) {
      console.warn("Intento de cargar pedidos sin usuarioId.");
      return;
    }

    this.ventaService.getVentasByUsuario(this.usuarioId).subscribe({
      next: ventas => {
        console.log("Pedidos obtenidos:", ventas); // 🔍 Verifica si llegan pedidos del backend
        this.pedidos = ventas.slice(0, 3);
      },
      error: error => console.error('Error al obtener pedidos:', error)
    });
  }

}

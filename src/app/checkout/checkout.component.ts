import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { CartService } from '../services/cart/cart.service';
import { VentaService } from '../services/ventas/venta.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, CommonModule, MatCheckboxModule, FormsModule, MatInputModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  recogerEnTienda: boolean = false;
  isProcessing: boolean = false;
  usuario: any = null;
  userRole: number | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private ventaService: VentaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().then(user => {
      if (user) {
        console.log(" Usuario autenticado:", user);
        this.usuario = user;
        this.userRole = user['tipo'] || user['rol_id'] || null;
      } else {
        console.warn(" No se encontró un usuario autenticado.");
      }
    }).catch(error => {
      console.error(" Error al obtener usuario:", error);
    });

    // 🔹 Cargar productos del carrito
    this.cartService.cart$.subscribe(items => {
      console.log('Contenido del carrito:', this.cartItems);

      this.cartItems = items;
    });
  }

  procesarPedido(): void {
    if (!this.usuario || !this.usuario.userId) {
      alert('Debes iniciar sesión para completar la compra.');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío, agrega productos antes de continuar.');
      return;
    }

    try {
      const nuevaVenta = {
        usuario_id: this.usuario.userId,
        direccion_id: this.usuario.direccion_id || null,
        total: this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
        recogerEnTienda: this.recogerEnTienda,
        productos: this.cartItems.map(item => {
            if (item.talla_id === null || item.talla_id === undefined || item.color_id === null || item.color_id === undefined) {
                console.error("🚨 Producto sin talla o color:", item);
                throw new Error('Producto sin talla o color.');
            }
            return {
                producto_id: item.id,
                talla_id: item.talla_id, // Permitir 0 como valor válido
                color_id: item.color_id, // Permitir 0 como valor válido
                cantidad: item.cantidad,
                precio_unitario: item.precio
            };
        })
    };



      console.log("📦 Venta a enviar:", nuevaVenta);

      this.ventaService.createVenta(nuevaVenta).subscribe({
        next: (response) => {
          console.log("✅ Venta creada con éxito:", response);
          alert('¡Pedido confirmado con éxito!');
          this.cartService.clearCart();
          this.router.navigate(['/perfil']);
        },
        error: (error) => {
          console.error('❌ Error al procesar la compra:', error);
          alert('Hubo un problema al procesar tu pedido.');
        }
      });

    } catch (error) {
      console.error("❌ Error procesando la venta:", error);
      alert("Por favor, asegúrate de que todos los productos tengan talla y color seleccionados.");
    }
  }
}

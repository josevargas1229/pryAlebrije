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
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { environment } from '../../environments/environment.development';
declare var paypal: any;


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, CommonModule, MatCheckboxModule, FormsModule, MatInputModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  cartItems: any[] = [];
  recogerEnTienda: boolean = false;
  isProcessing: boolean = false;
  usuario: any = null;
  userRole: number | null = null;

  @ViewChild('paypalButton', { static: false }) paypalButton!: ElementRef;
  paypalRendered: boolean = false;
  @ViewChild('mercadoPagoButton', { static: false }) mercadoPagoButton!: ElementRef;
  mercadoPagoRendered: boolean = false;


  ngAfterViewInit(): void {
  setTimeout(() => {
    // Solo renderizar si hay usuario, productos y aún no está renderizado
    if (this.usuario && this.cartItems.length > 0 && !this.paypalRendered) {
      this.renderPayPalButton();
    }
  }, 0); // Espera un ciclo de render de Angular
}

  constructor(
    private router: Router,
    private cartService: CartService,
    private ventaService: VentaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.authService.checkAuthStatus().then(user => {
    if (user) {
      console.log("✅ Usuario autenticado:", user);
      this.usuario = user;
      this.userRole = user['tipo'] || user['rol_id'] || null;

      // Escucha el carrito
      this.cartService.cart$.subscribe(items => {
        console.log('🛒 Contenido del carrito:', items);
        this.cartItems = items;

        const hayProductos = this.cartItems.length > 0;

        if (hayProductos) {
          if (!this.paypalRendered) {
            this.loadPayPalScript()
              .then(() => this.renderPayPalButton())
              .catch(err => console.error('❌ Error al cargar PayPal:', err));
          }

          if (!this.mercadoPagoRendered) {
            this.loadMercadoPagoScript()
              .then(() => this.renderMercadoPagoButton())
              .catch(err => console.error('❌ Error al cargar Mercado Pago:', err));
          }
        }
      });

    } else {
      console.warn("⚠️ No se encontró un usuario autenticado.");
    }
  }).catch(error => {
    console.error("❌ Error al obtener usuario:", error);
  });
}
loadPayPalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${environment.PAYPAL_CLIENT_ID}&currency=MXN`;
    script.onload = () => resolve();
    script.onerror = () => reject('❌ Falló al cargar el SDK de PayPal');
    document.body.appendChild(script);
  });
}
loadMercadoPagoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src*="mercadopago.com/js/v2"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve();
    script.onerror = () => reject('❌ Falló al cargar el SDK de Mercado Pago');
    document.body.appendChild(script);
  });
}


renderPayPalButton(): void {
  if (this.paypalRendered || !this.usuario || typeof paypal === 'undefined') {
    console.warn('🚫 SDK de PayPal no está disponible todavía.');
    return;
  }

  const total = this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  paypal.Buttons({
    createOrder: () => {
      return this.ventaService.crearOrdenPaypal(total.toFixed(2)).toPromise().then(res => {
        if (!res || !res.id) throw new Error('No se pudo obtener el ID de la orden PayPal');
        return res.id;
      });
    },
    onApprove: (data: any, actions: any) => {
  const total = this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const ventaData = {
    usuario_id: this.usuario.userId,
    direccion_id: this.usuario.direccion_id || null,
    recogerEnTienda: this.recogerEnTienda,
    productos: this.cartItems.map(item => ({
      producto_id: item.id,
      talla_id: item.talla_id,
      color_id: item.color_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    })),
    total: total.toFixed(2)
  };

  return this.ventaService.createVenta(ventaData).toPromise().then(venta => {
    if (!venta?.id) throw new Error('❌ No se obtuvo el ID de la venta');

    return this.ventaService.capturarOrdenPaypal(data.orderID, venta.id, this.usuario.userId).toPromise().then(() => {
      alert('✅ ¡Pago y pedido confirmados con éxito!');
      this.cartService.clearCart();
      this.router.navigate(['/perfil']);
    });
  }).catch(err => {
    if (err?.error?.details?.[0]?.issue === 'INSTRUMENT_DECLINED') {
      console.warn('🔁 Instrumento rechazado, reintentando...');
      return actions.restart();
    } else {
      console.error('❌ Error al procesar la compra:', err);
      alert('Error al completar la compra. Intenta nuevamente.');
    }
  });
},

    onError: (err: any) => {
      console.error('❌ Error general en PayPal:', err);
      alert('Error al procesar el pago con PayPal.');
    }
  }).render('#paypal-button-container');

  this.paypalRendered = true;
}


renderMercadoPagoButton(): void {
  if (this.mercadoPagoRendered || !this.usuario || !(window as any).MercadoPago) {
    console.warn('🚫 SDK de Mercado Pago no disponible o ya renderizado.');
    return;
  }

  const total = this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const productosFormateados = this.cartItems.map(item => ({
    nombre: item.nombre,
    precio_unitario: item.precio,
    cantidad: item.cantidad
  }));

  this.ventaService.crearPreferenciaMercadoPago(productosFormateados, total).subscribe(
    response => {
      if (!response?.id) {
        console.error('❌ Preferencia inválida recibida:', response);
        alert('Error al generar la preferencia de pago.');
        return;
      }

      const mp = new (window as any).MercadoPago(environment.MERCADOPAGO_PUBLIC_KEY, {
        locale: 'es-MX'
      });

      mp.checkout({
        preference: {
          id: response.id
        },
        render: {
          container: '#mercado-pago-button',
          label: 'Pagar con Mercado Pago'
        }
      });

      this.mercadoPagoRendered = true;
    },
    error => {
      console.error('❌ Error creando preferencia:', error);
      alert('No se pudo generar la preferencia de pago. Intenta nuevamente.');
    }
  );
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

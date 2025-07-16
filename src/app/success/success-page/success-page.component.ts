import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VentaService } from '../../services/ventas/venta.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [],
  templateUrl: './success-page.component.html',
  styleUrl: './success-page.component.scss'
})
export class SuccessPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.route.queryParams.subscribe(async params => {
    const paymentId = params['payment_id'];
    if (!paymentId) {
      console.error('❌ No se encontró el payment_id en la URL');
      return;
    }

    const user = await this.authService.checkAuthStatus();
    if (!user) {
      alert('Debes iniciar sesión para completar el registro.');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const paymentData = await this.http.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${environment.MERCADOPAGO_PUBLIC_KEY}`
          }
        }
      ).toPromise();

      console.log('✅ Datos del pago obtenidos:', paymentData);

      // Validar que el pago esté aprobado
      if (paymentData && paymentData['status'] === 'approved') {
        // Recuperar el carrito y recogerEnTienda desde localStorage
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const recogerEnTienda = JSON.parse(localStorage.getItem('recogerEnTienda') || 'false');

        if (!Array.isArray(carrito) || carrito.length === 0) {
          alert('No se encontraron productos para procesar la venta.');
          return;
        }

        const ventaData = {
          usuario_id: user.userId,
          direccion_id: user.direccion_id || null,
          total: paymentData['transaction_amount'],
          recogerEnTienda,
          productos: carrito.map((item: any) => ({
            producto_id: item.id,
            talla_id: item.talla_id,
            color_id: item.color_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
          }))
        };

        // Crear la venta
        const venta = await this.ventaService.createVenta(ventaData).toPromise();
        if (!venta?.id) throw new Error('No se pudo crear la venta.');

        // Registrar transacción
        this.ventaService.registrarTransaccionMercadoPago(venta.id, user.userId, paymentData).subscribe({
          next: () => {
            console.log('✅ Transacción registrada con éxito');
            alert('✅ ¡Pago y pedido registrados con éxito!');
            localStorage.removeItem('carrito');
            localStorage.removeItem('recogerEnTienda');
            this.router.navigate(['/perfil']);
          },
          error: err => {
            console.error('❌ Error al registrar la transacción:', err);
            alert('Pago realizado, pero ocurrió un error al registrar la transacción.');
          }
        });

      } else {
        alert('El pago no fue aprobado. No se procesará el pedido.');
        this.router.navigate(['/']);
      }

    } catch (err) {
      console.error('❌ Error al consultar el pago en Mercado Pago:', err);
      alert('No se pudo validar el pago. Contacta soporte.');
    }
  });
}
}

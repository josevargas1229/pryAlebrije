import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingButtonComponent } from '../components/loading-button/loading-button.component';
import { CartService } from '../services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    LoadingButtonComponent,
    CommonModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loadingPagar: boolean = false;
  loadingCarrito: boolean = false;

  constructor(
    private renderer: Renderer2,
    private cartService: CartService
  ) {}
  @ViewChild('menuContainer', { static: false }) menuContainer!: ElementRef;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.menuContainer.nativeElement, 'visible');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(this.menuContainer.nativeElement);
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(productoId: number, talla: string, cantidad: number, stock: number): void {
    if (cantidad > stock) {
      alert(`❌ No puedes agregar más de ${stock} unidades.`);
      cantidad = stock;
    } else if (cantidad < 1) {
      cantidad = 1;
    }
    this.cartService.updateQuantity(productoId, talla, cantidad);
  }

  onQuantityChange(event: Event, productoId: number, talla: string, stock: number): void {
    const inputElement = event.target as HTMLInputElement;
    const cantidad = Number(inputElement.value);
    this.updateQuantity(productoId, talla, cantidad, stock);
  }

  removeFromCart(productId: number, talla: string): void {
    this.cartService.removeFromCart(productId, talla);
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  getTotalWithShipping(): number {
    return this.getTotal();
  }

  procesarPago(): void {
    this.loadingPagar = true;
    setTimeout(() => {
      this.loadingPagar = false;
      console.log('Pago procesado con éxito');
    }, 2000);
  }

  agregarAlCarrito(): void {
    this.loadingCarrito = true;
    setTimeout(() => {
      this.loadingCarrito = false;
      console.log('Producto agregado al carrito');
    }, 2000);
  }

}

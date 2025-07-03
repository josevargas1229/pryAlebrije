import {
  Component, ElementRef, OnInit, AfterViewInit, OnDestroy,
  ViewChild, Renderer2, Inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar,MatSnackBarModule } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';

import { LoadingButtonComponent } from '../components/loading-button/loading-button.component';
import { CartService } from '../services/cart/cart.service';

/* === Modelo de los ítems del carrito === */
interface CartItem {
  id: number;
  nombre: string;
  tipoProducto: string;
  precio: number;
  cantidad: number;
  talla: string;
  color: string;
  imagen: string;
  stock: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    /* Angular common */
    CommonModule, RouterLink,

    /* Angular Material */
    MatButtonModule, MatCardModule, MatDividerModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule,
    MatDialogModule, MatSnackBarModule,

    /* Componentes propios */
    LoadingButtonComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideOut', [
      transition(':leave', [
        animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class CartComponent
  implements OnInit, AfterViewInit, OnDestroy {

  /* ==== PROPIEDADES ==== */
  cartItems: CartItem[] = [];
  loadingPagar = false;
  loadingCarrito = false;
  isLoading = false;                               // futura extensión
  private cartSubscription?: Subscription;

  /* ==== DI === */
  constructor(
    private renderer: Renderer2,
    private cartService: CartService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  /* ==== ANIMACIÓN DE ENTRADA DEL CONTENEDOR ==== */
  @ViewChild('menuContainer', { static: false })
  menuContainer!: ElementRef;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
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

  /* ==== SUBSCRIPCIÓN AL SERVICIO ==== */
  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: items => (this.cartItems = items as CartItem[]),
      error: err => {
        console.error('Error al cargar el carrito', err);
        this.showErrorMessage('Error al cargar el carrito');
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  /* ==== TRACKING OPTIMIZADO ==== */
  trackByFn = (_: number, item: CartItem) => `${item.id}-${item.talla}`;

  /* ==== QUANTITY ==== */
  updateQuantity(
    productoId: number,
    talla: string,
    cantidad: number,
    stock: number
  ): void {
    if (cantidad > stock) {
      this.showWarningMessage(`No puedes agregar más de ${stock} unidades`);
      cantidad = stock;
    } else if (cantidad < 1) {
      cantidad = 1;
    }

    try {
      this.cartService.updateQuantity(productoId, talla, cantidad);
      this.showSuccessMessage('Cantidad actualizada');
    } catch (err) {
      console.error('Error al actualizar la cantidad', err);
      this.showErrorMessage('Error al actualizar la cantidad');
    }
  }

  getTotalItems(): number {
  return this.cartItems.reduce((total, item) => total + item.cantidad, 0);
}


  onQuantityChange(
    event: Event,
    productoId: number,
    talla: string,
    stock: number
  ): void {
    const input = event.target as HTMLInputElement;
    const cantidad = Number(input.value);
    this.updateQuantity(productoId, talla, cantidad, stock);
  }

  /* ==== ELIMINAR ÍTEM ==== */
  confirmRemoveItem(item: CartItem): void {
    const dialogRef = this.dialog.open(ConfirmRemoveDialogComponent, {
      width: '400px',
      data: {
        productName: `${item.tipoProducto} ${item.nombre}`,
        size: item.talla,
        color: item.color
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.removeFromCart(item.id, item.talla);
    });
  }

  removeFromCart(productId: number, talla: string): void {
    try {
      this.cartService.removeFromCart(productId, talla);
      this.showSuccessMessage('Artículo eliminado del carrito');
    } catch (err) {
      console.error('Error al eliminar el artículo', err);
      this.showErrorMessage('Error al eliminar el artículo');
    }
  }

  /* ==== TOTALES ==== */
  getTotal = () =>
    this.cartItems.reduce((tot, it) => tot + it.precio * it.cantidad, 0);

  getShippingCost = () => (this.getTotal() >= 500 ? 0 : 50);

  getTotalWithShipping = () => this.getTotal() + this.getShippingCost();

  isShippingFree = () => this.getShippingCost() === 0;

  /* ==== UTILIDADES ==== */
  private showSuccessMessage(msg: string) {
    this.snackBar.open(msg, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(msg: string) {
    this.snackBar.open(msg, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showWarningMessage(msg: string) {
    this.snackBar.open(msg, 'Cerrar', {
      duration: 4000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /* ==== ACCIONES DE PAGO / CARRITO ==== */
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

/* ------------------------------------------------------------------ */
/*           DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN                    */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-confirm-remove-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Confirmar eliminación</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que deseas eliminar este artículo del carrito?</p>
      <div class="product-info">
        <strong>{{ data.productName }}</strong><br>
        <small>Talla: {{ data.size }} | Color: {{ data.color }}</small>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete</mat-icon> Eliminar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
    }
    mat-dialog-actions { padding: 16px 24px; }
  `]
})
export class ConfirmRemoveDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

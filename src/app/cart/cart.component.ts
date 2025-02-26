import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingButtonComponent } from '../components/loading-button/loading-button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    LoadingButtonComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  loadingPagar: boolean = false;
  loadingCarrito: boolean = false;

  constructor(
    private renderer: Renderer2
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
  
  ngOnInit(): void {}

  procesarPago(): void {
    this.loadingPagar = true;
    setTimeout(() => {
      this.loadingPagar = false;
      console.log('Pago procesado con éxito'); // Aquí puedes redirigir a la pasarela de pago
    }, 2000);
  }

  agregarAlCarrito(): void {
    this.loadingCarrito = true;
    setTimeout(() => {
      this.loadingCarrito = false;
      console.log('Producto agregado al carrito'); // Aquí puedes hacer la lógica real de añadir al carrito
    }, 2000);
  }
}

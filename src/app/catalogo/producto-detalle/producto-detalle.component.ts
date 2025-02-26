import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../../private/productos/services/producto.service';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    CurrencyPipe,
    CommonModule,
    MatIconModule,
    LoadingButtonComponent
  ],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.scss'
})
export class ProductoDetalleComponent implements OnInit, AfterViewInit {
  producto: any = null;
  productoId!: number;
  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ){}

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('detalleContainer', { static: false }) detalleContainer!: ElementRef;
  @ViewChild('relaContainer', { static: false }) relaContainer!: ElementRef;
  loadingCompra: boolean = false;
  loadingCarrito: boolean = false;

  comprarAhora(): void {
    this.loadingCompra = true;
    setTimeout(() => {
      this.loadingCompra = false;
      console.log('Compra realizada'); // Aquí puedes redirigir a una página de pago
    }, 2000);
  }

  agregarAlCarrito(): void {
    this.loadingCarrito = true;
    setTimeout(() => {
      this.loadingCarrito = false;
      console.log('Producto agregado al carrito'); // Aquí puedes hacer la lógica real
    }, 2000);
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 } // Se activa cuando el 20% del elemento es visible
    );

    if (this.detalleContainer) {
      observer.observe(this.detalleContainer.nativeElement);
    }

    if (this.relaContainer) {
      observer.observe(this.relaContainer.nativeElement);
    }
  }

  scrollIzquierda() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft -= 300;
    }
  }

  scrollDerecha() {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollLeft += 300;
    }
  }

  ngOnInit(): void {
    // Obtener el ID del producto desde la URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productoId = +id;
        this.obtenerProductoDetalle(this.productoId);
      }
    });
  }
  obtenerProductoDetalle(id: number): void {
    this.productoService.getProductoById(id).subscribe(response => {
      this.producto = response.producto;
      console.log('Producto obtenido:', this.producto); // Verificar si el tipo de producto llega correctamente
    }, error => {
      console.error('Error al obtener detalles del producto:', error);
    });
  }

 }

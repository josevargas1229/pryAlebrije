import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../../private/productos/services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  coloresUnicos: any[] = [];
  tallasUnicas: any[] = [];
  colorSeleccionado: any = null;
  tallaSeleccionada: number | null = null;
  imagenesActuales: any[] = [];
  imagenPrincipal: string = '';
  stockDisponible: number = 0;
  esPrevisualizacion: boolean = false; // Determina si es previsualización

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('detalleContainer', { static: false }) detalleContainer!: ElementRef;
  loadingCompra: boolean = false;
  loadingCarrito: boolean = false;

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productoId = +id;
        // Determinar si estamos en la ruta de previsualización
        this.esPrevisualizacion = this.router.url.includes('/preview');
        this.obtenerProductoDetalle(this.productoId);
      }
    });
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
      { threshold: 0.2 }
    );

    if (this.detalleContainer) {
      observer.observe(this.detalleContainer.nativeElement);
    }
  }

  obtenerProductoDetalle(id: number): void {
    this.productoService.getProductoById(id).subscribe(response => {
      this.producto = response.producto;
      console.log('Producto obtenido:', this.producto);
      this.inicializarDatos();
    }, error => {
      console.error('Error al obtener detalles del producto:', error);
    });
  }

  inicializarDatos(): void {
    const coloresMap = new Map<number, any>();
    this.producto.tallasColoresStock.forEach((variante: any) => {
      const color = variante.coloresStock;
      if (color && !coloresMap.has(color.id)) {
        coloresMap.set(color.id, color);
      }
    });
    this.coloresUnicos = Array.from(coloresMap.values());

    const tallasMap = new Map<number, any>();
    this.producto.tallasColoresStock.forEach((variante: any) => {
      const talla = variante.talla;
      if (talla && !tallasMap.has(talla.id)) {
        tallasMap.set(talla.id, talla);
      }
    });
    this.tallasUnicas = Array.from(tallasMap.values());

    if (this.coloresUnicos.length > 0) {
      this.seleccionarColor(this.coloresUnicos[0]);
    }
    if (this.tallasUnicas.length > 0) {
      this.tallaSeleccionada = this.tallasUnicas[0].id;
      this.verificarStock();
    }
  }

  seleccionarColor(color: any): void {
    this.colorSeleccionado = color;
    this.imagenesActuales = color.imagenes || [];
    this.imagenPrincipal = this.imagenesActuales.length > 0 ? this.imagenesActuales[0].url : 'assets/images/ropa.jpg';
    this.verificarStock();
  }

  cambiarImagenPrincipal(url: string): void {
    this.imagenPrincipal = url;
  }

  verificarStock(): void {
    if (this.colorSeleccionado && this.tallaSeleccionada) {
      const variante = this.producto.tallasColoresStock.find((v: any) =>
        v.talla.id === this.tallaSeleccionada && v.coloresStock.id === this.colorSeleccionado.id
      );
      this.stockDisponible = variante ? variante.stock : 0;
    } else {
      this.stockDisponible = 0;
    }
  }

  comprarAhora(): void {
    if (!this.esPrevisualizacion) {
      this.loadingCompra = true;
      setTimeout(() => {
        this.loadingCompra = false;
        console.log('Compra realizada');
      }, 2000);
    }
  }

  agregarAlCarrito(): void {
    if (!this.esPrevisualizacion) {
      this.loadingCarrito = true;
      setTimeout(() => {
        this.loadingCarrito = false;
        console.log('Producto agregado al carrito');
      }, 2000);
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
}
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
import { CartService } from '../../services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalificacionService } from '../../services/califica/calificacion.service';
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
  calificacionPromedio: number = 0;
  totalCalificaciones: number = 0;
  ranking: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  estrellasArray: number[] = Array(5).fill(0);
  usuarioId: number = 2; // Simulación de usuario autenticado
  coloresUnicos: any[] = [];
  tallasUnicas: any[] = [];
  colorSeleccionado: any = null;
  tallaSeleccionada: number | null = null;
  imagenesActuales: any[] = [];
  imagenPrincipal: string = '';
  stockDisponible: number = 0;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('detalleContainer', { static: false }) detalleContainer!: ElementRef;
  loadingCompra: boolean = false;
  loadingCarrito: boolean = false;

  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private calificacionService: CalificacionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productoId = +id;
        this.obtenerProductoDetalle(this.productoId);
        this.obtenerCalificacionProducto();
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
    // Extraer colores únicos
    const coloresMap = new Map<number, any>();
    this.producto.tallasColoresStock.forEach((variante: any) => {
      const color = variante.coloresStock;
      if (color && !coloresMap.has(color.id)) {
        coloresMap.set(color.id, color);
      }
    });
    this.coloresUnicos = Array.from(coloresMap.values());

    // Extraer tallas únicas
    const tallasMap = new Map<number, any>();
    this.producto.tallasColoresStock.forEach((variante: any) => {
      const talla = variante.talla;
      if (talla && !tallasMap.has(talla.id)) {
        tallasMap.set(talla.id, talla);
      }
    });
    this.tallasUnicas = Array.from(tallasMap.values());

    // Seleccionar el primer color y talla por defecto
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
    this.imagenPrincipal = this.imagenesActuales.length > 0 ? this.imagenesActuales[0].url : 'assets/images/ropa.jpg'; // Imagen por defecto si no hay
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
    this.loadingCompra = true;
    setTimeout(() => {
      this.loadingCompra = false;
      console.log('Compra realizada');
    }, 2000);
  }

  agregarAlCarrito(): void {
    if (!this.colorSeleccionado || !this.tallaSeleccionada) {
      this.snackBar.open('Selecciona una talla antes de agregar al carrito', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (this.stockDisponible <= 0) {
      this.snackBar.open('Este producto está agotado', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loadingCarrito = true;
    setTimeout(() => {
      this.loadingCarrito = false;
      this.cartService.addToCart({
        id: this.producto.id,
        nombre: this.producto.nombre,
        talla: this.tallasUnicas.find(t => t.id === this.tallaSeleccionada)?.talla || 'Sin talla',
        precio: this.producto.precio,
        imagen: this.imagenPrincipal,
        stock: this.stockDisponible // Se agrega el stock al carrito
      });

      this.snackBar.open(`Agregado exitosamente al carrito 🛒`, 'Cerrar', {
        duration: 3000
      });
    }, 1000);
  }

  obtenerCalificacionProducto(): void {
    this.calificacionService.getCalificacionProducto(this.productoId).subscribe(response => {
      this.calificacionPromedio = response.promedio;
      this.totalCalificaciones = response.total;
      this.calcularRanking(response.detalle); // Llamamos a calcular el ranking
    });
  }

  calificar(valor: number): void {
    this.calificacionService.addCalificacionProducto(this.productoId, this.usuarioId, valor)
      .subscribe({
        next: () => {
          this.snackBar.open('Calificación registrada correctamente', 'Cerrar', { duration: 3000 });
          this.obtenerCalificacionProducto(); // Recargar ranking y calificación
        },
        error: (err) => {
          this.snackBar.open(err.message, 'Cerrar', { duration: 3000 });
        }
      });
  }

  calcularRanking(detalleCalificaciones: { estrella: number; cantidad: number }[]): void {
    this.ranking = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    detalleCalificaciones.forEach(item => {
      this.ranking[item.estrella] = item.cantidad;
    });
  }

  obtenerPorcentajeRanking(estrella: number): number {
    if (this.totalCalificaciones === 0) return 0;
    return (this.ranking[estrella] / this.totalCalificaciones) * 100;
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

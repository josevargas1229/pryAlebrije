import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../../private/productos/services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
import { CartService } from '../../services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalificacionService } from '../../services/califica/calificacion.service';
import { AuthService } from '../../services/auth/auth.service';
import { RecomendacionService, Recomendacion } from '../../services/recomendacion/recomendacion.service';
import { PrecacheService, DetalleProductoCache } from '../../precache.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
    LoadingButtonComponent,
    FormsModule,
    RouterLink
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
  usuario: any = null;
  coloresUnicos: any[] = [];
  tallasUnicas: any[] = [];
  colorSeleccionado: any = null;
  tallaSeleccionada: number | null = null;
  imagenesActuales: any[] = [];
  imagenPrincipal: string = '';
  stockDisponible: number = 0;
  cantidadSeleccionada: number = 1;
  esPrevisualizacion: boolean = false; // Determina si es previsualización
  yaCalifico: boolean = false;
  productosRelacionados: Recomendacion[] = [];


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
    private calificacionService: CalificacionService,
    private readonly router: Router,
    private recomendacionService: RecomendacionService,
    private authService: AuthService,
    private precacheService: PrecacheService
  ) { }

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {
      this.productoId = +id;
      // Determinar si estamos en la ruta de previsualización
      this.esPrevisualizacion = this.router.url.includes('/preview');

      if (navigator.onLine) {
        // ONLINE → flujo normal
        this.obtenerProductoDetalle(this.productoId);
        this.obtenerProductosRelacionados(this.productoId);
        this.obtenerCalificacionProducto();
      } else {
        // OFFLINE → NO llamar API, usar cache
        this.cargarProductoDesdeCache(this.productoId);

        // Dejar calificaciones y relacionados en estado neutro
        this.calificacionPromedio = 0;
        this.totalCalificaciones = 0;
        this.estrellasArray = Array(5).fill(0);
        this.ranking = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        this.productosRelacionados = [];
      }
    }
  });

  this.authService.checkAuthStatus().then(user => {
    if (user) {
      console.log("Usuario autenticado:", user);
      this.usuario = user;
      this.verificarSiYaCalifico();
    } else {
      console.warn("No se encontró un usuario autenticado.");
      this.usuario = null;
    }
  }).catch(error => {
    console.error("Error al obtener usuario:", error);
  });
}


  verificarSiYaCalifico(): void {
  // Si no hay red, no intentes ir al backend
  if (!navigator.onLine) {
    return;
  }

  if (this.usuario && this.usuario.userId) {
    this.calificacionService.verificarCalificacionUsuario(this.productoId, this.usuario.userId)
      .subscribe({
        next: (response: any) => {
          if (response.yaCalifico) {
            this.yaCalifico = true;
            this.calificacionPromedio = response.calificacion;
            this.estrellasArray = Array(5).fill(0).map((_, index) => index < response.calificacion ? 1 : 0);
          }
        },
        error: (error) => {
          console.error('Error al verificar si ya calificó:', error);
        }
      });
  }
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
  this.productoService.getProductoById(id).subscribe({
    next: (response) => {
      this.producto = response.producto;

      const tienePromocion = this.producto.promocion !== null && this.producto.promocion?.descuento > 0;
      const precioFinal = tienePromocion
        ? this.producto.precio * (1 - this.producto.promocion.descuento / 100)
        : this.producto.precio;

      this.producto.tienePromocion = tienePromocion;
      this.producto.precioFinal = precioFinal;

      // OPCIONAL: si tu backend ya trae imagenPrincipal, úsala
      if (this.producto.imagenPrincipal) {
        this.imagenPrincipal = this.producto.imagenPrincipal;
      }

      // GUARDAR UNA VERSIÓN CACHEADA MÍNIMA PARA MODO OFFLINE
      try {
        const cache: DetalleProductoCache = {
          id: this.producto.id,
          tipoProducto: this.producto.tipo?.nombre || 'Tipo desconocido',
          marca: this.producto.marca?.nombre || 'Marca desconocida',
          categoria: this.producto.categoria?.nombre || 'Categoría desconocida',
          talla: 'Sin talla',
          color: 'Color desconocido',
          precio: this.producto.precio,
          imagen: this.producto.imagenPrincipal || 'assets/images/ropa.jpg',
          stock: 0,
          talla_id: null,
          color_id: null
        };

        // Reutilizamos el mismo key pattern que PrecacheService
        localStorage.setItem(
          `pwa.cache.producto.${this.producto.id}`,
          JSON.stringify(cache)
        );
      } catch (e) {
        console.warn('No se pudo cachear el producto en localStorage', e);
      }

      console.log('Producto obtenido:', this.producto);
      this.inicializarDatos();
    },
    error: (error) => {
      console.error('Error al obtener detalles del producto:', error);
    }
  });
}

private cargarProductoDesdeCache(id: number): void {
  const cache = this.leerCacheLocalProducto(id);

  if (!cache) {
    console.warn('Sin conexión y sin producto cacheado para id', id);
    return;
  }

  this.producto = {
    id: cache.id,
    // si no guardas nombre en el cache, puedes poner un fallback
    nombre: (cache as any).nombre || 'Producto offline',
    tipo: { nombre: cache.tipoProducto },
    marca: { nombre: cache.marca },
    categoria: { nombre: cache.categoria },
    precio: cache.precio,
    promocion: null,
    tallasColoresStock: [],
    imagenPrincipal: cache.imagen,
    tienePromocion: false,
    precioFinal: cache.precio
  };

  this.imagenPrincipal = cache.imagen || 'assets/images/ropa.jpg';
  this.imagenesActuales = [{ url: this.imagenPrincipal }];
  this.coloresUnicos = [];
  this.tallasUnicas = [];
  this.inicializarDatos();
}


// Fallback a lo que guardaste manualmente en localStorage dentro de obtenerProductoDetalle
private leerCacheLocalProducto(id: number): DetalleProductoCache | null {
  const raw = localStorage.getItem(`pwa.cache.producto.${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DetalleProductoCache;
  } catch {
    return null;
  }
}



obtenerProductosRelacionados(productId: number): void {
  this.recomendacionService.obtenerRelacionados(productId, 8).subscribe({
    next: (recomendaciones) => {
      const promesas = recomendaciones.map(reco =>
        this.productoService.getProductoById(reco.producto_id).toPromise()
          .then(resp => {
            const prod = resp.producto;
            const imagen = this.getImagenPrincipal(prod);
            const tienePromocion = prod.promocion !== null && prod.promocion?.descuento > 0;
            const precioFinal = tienePromocion
              ? prod.precio * (1 - prod.promocion.descuento / 100)
              : prod.precio;

            return {
              ...reco,
              imagen_url: imagen,
              precio: prod.precio,
              tienePromocion,
              precioFinal,
              descuento: tienePromocion ? prod.promocion.descuento : null
            };
          })
          .catch(() => ({
            ...reco,
            imagen_url: 'assets/images/ropa.jpg',
            precio: 0,
            tienePromocion: false,
            precioFinal: 0,
            descuento: null
          }))
      );

      Promise.all(promesas).then(res => {
        this.productosRelacionados = res;
      });
    },
    error: (error) => {
      console.error('Error al cargar productos relacionados:', error.message);
    }
  });
}


private getImagenPrincipal(producto: any): string {
  const stock = producto.tallasColoresStock?.[0];
  const imagen = stock?.coloresStock?.imagenes?.[0]?.url;
  return imagen && imagen.length > 0 ? imagen : 'assets/images/ropa.jpg';
}


irADetalleProducto(productoId: number): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  this.router.navigate(['/menu-catalogo/productos/producto-detalle', productoId]);
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
    if (!this.colorSeleccionado || !this.tallaSeleccionada) {
      this.snackBar.open('Selecciona una talla y un color antes de continuar con la compra', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.cantidadSeleccionada > this.stockDisponible) {
      this.snackBar.open(`Solo hay ${this.stockDisponible} unidades disponibles`, 'Cerrar', { duration: 3000 });
      return;
    }

    const talla_id = this.tallaSeleccionada;
    const color_id = this.colorSeleccionado.id;

    this.loadingCompra = true;

    const productoAlCarrito = {
      id: this.producto.id,
      nombre: this.producto.nombre,
      tipoProducto: this.producto.tipo?.nombre || 'Tipo desconocido',
      marca: this.producto.marca?.nombre || 'Marca desconocida',
      categoria: this.producto.categoria?.nombre || 'Categoría desconocida',
      talla: this.tallasUnicas.find(t => t.id === talla_id)?.talla || 'Sin talla',
      color: this.colorSeleccionado.color || 'Color desconocido',
      precio: this.producto.precio,
      precioConDescuento: this.producto.tienePromocion ? this.producto.precioFinal : undefined,
      imagen: this.imagenPrincipal,
      stock: this.stockDisponible,
      talla_id: talla_id,
      color_id: color_id,
      cantidad: this.cantidadSeleccionada
    };

    // Agregar el producto al carrito temporalmente
    this.cartService.addToCart(productoAlCarrito);

    // Redirigir al checkout
    this.router.navigate(['/checkout']);
  }


  agregarAlCarrito(): void {
    if (!this.colorSeleccionado || !this.tallaSeleccionada) {
      this.snackBar.open('Selecciona una talla y un color antes de agregar al carrito', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.cantidadSeleccionada > this.stockDisponible) {
      this.snackBar.open(`Solo hay ${this.stockDisponible} unidades disponibles`, 'Cerrar', { duration: 3000 });
      return;
    }

    const talla_id = this.tallaSeleccionada;
    const color_id = this.colorSeleccionado.id;

    this.loadingCarrito = true;

    setTimeout(() => {
      this.loadingCarrito = false;

      const productoAlCarrito = {
        id: this.producto.id,
        nombre: this.producto.nombre,
        tipoProducto: this.producto.tipo?.nombre || 'Tipo desconocido',
        marca: this.producto.marca?.nombre || 'Marca desconocida',
        categoria: this.producto.categoria?.nombre || 'Categoría desconocida',
        talla: this.tallasUnicas.find(t => t.id === talla_id)?.talla || 'Sin talla',
        color: this.colorSeleccionado.color || 'Color desconocido',
        precio: this.producto.precio,
        precioConDescuento: this.producto.tienePromocion ? this.producto.precioFinal : undefined,
        imagen: this.imagenPrincipal,
        stock: this.stockDisponible,
        talla_id: talla_id,
        color_id: color_id,
        cantidad: this.cantidadSeleccionada
      };

      this.cartService.addToCart(productoAlCarrito);

      this.snackBar.open("Producto agregado exitosamente al carrito 🛒", 'Cerrar', { duration: 3000 });

    }, 1000);
  }

  obtenerCalificacionProducto(): void {
  // Si no hay conexión, no dispares la llamada
  if (!navigator.onLine) {
    this.calificacionPromedio = 0;
    this.totalCalificaciones = 0;
    this.estrellasArray = Array(5).fill(0);
    this.ranking = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    return;
  }

  this.calificacionService.getCalificacionProducto(this.productoId)
    .subscribe({
      next: (response) => {
        this.calificacionPromedio = response.promedio || 0;
        this.totalCalificaciones = response.total || 0;
        this.estrellasArray = Array(5).fill(0).map((_, i) => i < this.calificacionPromedio ? 1 : 0);
        this.calcularRanking(response.detalle || []);
      },
      error: (error) => {
        console.error('Error al obtener calificación del producto:', error);
        // Valores neutros para que la vista siga funcionando
        this.calificacionPromedio = 0;
        this.totalCalificaciones = 0;
        this.estrellasArray = Array(5).fill(0);
        this.ranking = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      }
    });
}




  calificar(valor: number): void {
    if (!this.usuario || !this.usuario.userId) {
      this.snackBar.open('Debes iniciar sesión para calificar el producto.', 'Cerrar', { duration: 3000 });
      return;
    }

    // Revisar si el usuario ya había calificado antes
    const calificacionAnterior = this.estrellasArray.findIndex(star => star === 1) + 1;

    this.calificacionService.addCalificacionProducto(this.productoId, this.usuario.userId, valor)
      .subscribe({
        next: () => {
          this.estrellasArray = Array(5).fill(0).map((_, index) => (index < valor ? 1 : 0));
          this.calificacionPromedio = valor;

          if (calificacionAnterior === 0) {
            this.totalCalificaciones += 1;
          } else if (calificacionAnterior !== valor) {

            this.ranking[calificacionAnterior] = Math.max((this.ranking[calificacionAnterior] || 1) - 1, 0);
          }

          this.ranking[valor] = (this.ranking[valor] || 0) + 1;
          this.yaCalifico = true;
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

  incrementarCantidad(): void {
    if (this.cantidadSeleccionada < this.stockDisponible) {
      this.cantidadSeleccionada++;
    } else {
      this.snackBar.open(`Solo hay ${this.stockDisponible} disponibles.`, 'Cerrar', { duration: 3000 });
    }
  }

  decrementarCantidad(): void {
    if (this.cantidadSeleccionada > 1) {
      this.cantidadSeleccionada--;
    }
  }
}

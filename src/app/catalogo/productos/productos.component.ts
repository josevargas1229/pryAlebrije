import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { ProductoService } from '../../private/productos/services/producto.service';
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
import { CartService } from '../../services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { CalificacionService } from '../../services/califica/calificacion.service';
import { PrecacheService } from '../../precache.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    RouterLink,
    LoadingButtonComponent,
    MatSelectModule
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  searchText: string = '';
  productos: any[] = [];
  filteredProductos: any[] = [];
  @ViewChild('productosContainer', { static: false }) productosContainer!: ElementRef;
  loadingCarrito: { [key: number]: boolean } = {};

  filtrosVisibles: boolean = true;
  coloresVisibles: boolean = false;
  categoriaVisibles: boolean = false;
  tipoProductoVisibles: boolean = false;
  marcaVisibles: boolean = false;
  tallaVisibles: boolean = false;

  categorias: any[] = [];
  tiposProductos: any[] = [];
  marcas: any[] = [];
  colores: any[] = [];
  tallas: any[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isLoading: boolean = false;
  hasMore: boolean = true; // Controla si hay más productos por cargar

  precioVisibles: boolean = false; // Controla la visibilidad del filtro por precio
  rangoPrecios: { precio_min: number, precio_max: number } = { precio_min: 0, precio_max: 0 };
  precioMinSeleccionado: number | null = null;
  precioMaxSeleccionado: number | null = null;
  ordenSeleccionado: string = 'mayor-menor';
  estrellasArray: number[] = Array(5).fill(0);


  constructor(
    private searchService: SearchService,
    private productoService: ProductoService,
    private renderer: Renderer2,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private calificacionService: CalificacionService,
    private precacheService: PrecacheService
  ) { }

   ngOnInit(): void {
    this.obtenerFiltros();
    const cached = this.precacheService.getCachedProductosTop10?.() || [];

    if (!navigator.onLine && cached.length > 0) {
      // OFFLINE y hay cache: usarlo
      const productosMapeados = this.mapearProductos(cached);
      this.productos = [...productosMapeados];
      this.filteredProductos = [...productosMapeados];
      this.totalItems = productosMapeados.length;
      this.hasMore = false;
      this.isLoading = false;
    } else {

      this.loadMoreProducts();
    }


    this.searchService.search$.subscribe(text => {
      this.searchText = text;
      this.resetAndLoad();
    });
  }


  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.productosContainer.nativeElement, 'visible');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(this.productosContainer.nativeElement);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    if (!this.isLoading && this.hasMore && this.isNearBottom()) {
      this.loadMoreProducts();
    }
  }

  // Verificar si estamos cerca del final de la página
  isNearBottom(): boolean {
    const threshold = 300; // Píxeles antes del final
    const scrollPosition = window.scrollY + window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    const nearBottom = scrollPosition >= totalHeight - threshold;
    return nearBottom;
  }

  agregarAlCarrito(producto: any): void {
    this.loadingCarrito[producto.id] = true;

    setTimeout(() => {
      this.loadingCarrito[producto.id] = false;

      if (!producto.variantes || producto.variantes.length === 0) {
        this.snackBar.open(`❌ El producto ${producto.nombre} no tiene variantes disponibles.`, 'Cerrar', { duration: 3000 });
        return;
      }

      // Si el producto no tiene una variante seleccionada, tomamos la primera disponible
      let varianteConStock = producto.variantes.find((variante: any) => variante.stock > 0);

      if (!varianteConStock) {
        this.snackBar.open(`❌ No hay stock disponible para ${producto.nombre}.`, 'Cerrar', { duration: 3000 });
        return;
      }

      // Tomar la primera talla y color si no existen en el objeto
      const talla_id = varianteConStock.talla_id || producto.variantes[0].talla_id;
      const color_id = varianteConStock.color_id || producto.variantes[0].color_id;
      const talla = varianteConStock.talla || producto.variantes[0].talla;
      const color = varianteConStock.color || producto.variantes[0].color;

      const productoAlCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        tipoProducto: producto.tipo?.nombre || 'Tipo desconocido',
        marca: producto.marca?.nombre || 'Marca desconocida',
        categoria: producto.categoria?.nombre || 'Categoría desconocida',
        talla: talla || 'Sin talla',
        color: color || 'Color desconocido',
        precio: producto.precio,
        imagen: producto.imagenPrincipal || 'assets/images/ropa.jpg',
        stock: varianteConStock.stock,
        talla_id: talla_id,
        color_id: color_id,
        cantidad: 1
      };

      this.cartService.addToCart(productoAlCarrito);

      this.snackBar.open(`✅ ${producto.nombre} agregado al carrito exitosamente.`, 'Cerrar', { duration: 3000 });

    }, 1000);
  }
  generarEstrellasArray(calificacionPromedio: number): number[] {
    return Array(5).fill(0).map((_, index) => index < calificacionPromedio ? 1 : 0);
  }


    private mapearProductos(productos: any[]): any[] {
    return productos.map(producto => {
      const tienePromocion = producto.promocion !== null && producto.promocion?.descuento > 0;
      const precioFinal = tienePromocion
        ? producto.precio * (1 - producto.promocion.descuento / 100)
        : producto.precio;

      return {
        ...producto,
        imagenPrincipal: this.getImagenPrincipal(producto),
        tienePromocion,
        precioFinal
      };
    });
  }


  loadMoreProducts(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    const filtros = this.getFiltrosSeleccionados();
    const params = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...filtros,
      estado: 'true',
      search: this.searchText.trim() || undefined
    };

    this.productoService.getAllProductos(params).subscribe({
      next: (response) => {
        const nuevosProductos = this.mapearProductos(response.productos);
        this.productos = [...this.productos, ...nuevosProductos];
        this.filteredProductos = [...this.productos];
        this.totalItems = response.totalItems || this.productos.length;
        this.currentPage++;
        this.isLoading = false;
        this.hasMore = nuevosProductos.length === this.pageSize && this.productos.length < this.totalItems;
        this.ordenarProductos();
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.isLoading = false;
      }
    });
  }

  getImagenPrincipal(producto: any): string {

    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes[0].url;
    } else {
      return 'assets/images/ropa.jpg';
    }
  }

  ordenarProductos(): void {
    this.filteredProductos.sort((a, b) => {
      if (this.ordenSeleccionado === 'mayor-menor') {
        return b.precio - a.precio;
      } else if (this.ordenSeleccionado === 'menor-mayor') {
        return a.precio - b.precio;
      }
      return 0; // En caso de que no haya criterio válido
    });
  }


  resetAndLoad(): void {
    this.currentPage = 1;
    this.productos = [];
    this.filteredProductos = [];
    this.hasMore = true;
    this.loadMoreProducts();
  }

  obtenerFiltros(): void {
    this.productoService.getAllFilters().subscribe({
      next: (response) => {
        this.categorias = response.categorias.map(c => ({ ...c, seleccionado: false }));
        this.tiposProductos = response.tipos.map(t => ({ ...t, seleccionado: false }));
        this.marcas = response.marcas.map(m => ({ ...m, seleccionado: false }));
        this.colores = response.colores.map(c => ({ ...c, seleccionado: false }));
        this.tallas = response.tallas.map(t => ({ ...t, seleccionado: false }));
        this.rangoPrecios = response.rangoPrecios;
        this.precioMinSeleccionado = null;  // No se inicializa con el precio mínimo recibido
        this.precioMaxSeleccionado = null;  // No se inicializa con el precio máximo recibido

      },
      error: (error) => {
        console.error('Error al obtener filtros:', error);
      }
    });
  }

  getFiltrosSeleccionados(): any {
    const filtros: any = {};

    const categoriasSeleccionadas = this.categorias.filter(c => c.seleccionado).map(c => c.id);
    if (categoriasSeleccionadas.length > 0) filtros.categoria_id = categoriasSeleccionadas; // Arreglo completo

    const tiposSeleccionados = this.tiposProductos.filter(t => t.seleccionado).map(t => t.id);
    if (tiposSeleccionados.length > 0) filtros.tipo_id = tiposSeleccionados;

    const marcasSeleccionadas = this.marcas.filter(m => m.seleccionado).map(m => m.id);
    if (marcasSeleccionadas.length > 0) filtros.marca_id = marcasSeleccionadas;

    const tallasSeleccionadas = this.tallas.filter(t => t.seleccionado).map(t => t.id);
    if (tallasSeleccionadas.length > 0) filtros.talla_id = tallasSeleccionadas;

    const coloresSeleccionados = this.colores.filter(c => c.seleccionado).map(c => c.id);
    if (coloresSeleccionados.length > 0) filtros.color_id = coloresSeleccionados;

    if (this.precioMinSeleccionado !== null) filtros.precio_min = this.precioMinSeleccionado;
    if (this.precioMaxSeleccionado !== null) filtros.precio_max = this.precioMaxSeleccionado;


    return filtros;
  }

  applyFilters(): void {
    console.log('Aplicando filtros');
    this.resetAndLoad();
  }

  getTallasDisponibles(producto: any): string {
    if (!producto.variantes || producto.variantes.length === 0) {
      return 'Sin talla disponible';
    }
    return producto.variantes
      .map(v => v.talla)
      .filter(talla => talla)
      .join(', ');
  }

  toggleFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  toggleFilter(item: any, tipo: string): void {
    item.seleccionado = !item.seleccionado;
    this.applyFilters();
  }

  toggleSeccion(seccion: string): void {
    if (seccion === 'colores') this.coloresVisibles = !this.coloresVisibles;
    if (seccion === 'categoria') this.categoriaVisibles = !this.categoriaVisibles;
    if (seccion === 'tipoProducto') this.tipoProductoVisibles = !this.tipoProductoVisibles;
    if (seccion === 'marca') this.marcaVisibles = !this.marcaVisibles;
    if (seccion === 'talla') this.tallaVisibles = !this.tallaVisibles;
    if (seccion === 'precio') this.precioVisibles = !this.precioVisibles;
  }
}

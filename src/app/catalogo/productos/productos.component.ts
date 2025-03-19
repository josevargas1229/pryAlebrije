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
    LoadingButtonComponent
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

  constructor(
    private searchService: SearchService,
    private productoService: ProductoService,
    private renderer: Renderer2,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit: Iniciando componente');
    this.obtenerFiltros();
    this.loadMoreProducts();
    this.searchService.search$.subscribe(text => {
      this.searchText = text;
      this.resetAndLoad();
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Configurando observer');
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
      this.cartService.addToCart(producto); // Agregar producto al carrito
      this.snackBar.open(`agregado exitosamente al carrito 🛒`, 'Cerrar', { // Mostrar notificación
        duration: 3000
      });
    }, 1000);
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
        const nuevosProductos = response.productos.map(producto => ({
          ...producto,
          tallas: producto.variantes ? producto.variantes.map(v => v.talla) : []
        }));
        this.productos = [...this.productos, ...nuevosProductos];
        this.filteredProductos = [...this.productos];
        this.totalItems = response.totalItems || this.productos.length;
        this.currentPage++;
        this.isLoading = false;
        this.hasMore = nuevosProductos.length === this.pageSize && this.productos.length < this.totalItems;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.isLoading = false;
      }
    });
  }

  resetAndLoad(): void {
    console.log('Reseteando y recargando productos');
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
  }
}

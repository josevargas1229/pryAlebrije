import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
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
  loadingCarrito: { [key: number]: boolean } = {}; // Objeto para manejar el loading de cada producto

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
console: any;

  constructor(
    private searchService: SearchService,
    private productoService: ProductoService,
    private renderer: Renderer2
  ) {}

agregarAlCarrito(productoId: number): void {
  this.loadingCarrito[productoId] = true; // Activa el loading para este producto

  // Simula una petición al servidor (sustitúyelo por la lógica real)
  setTimeout(() => {
    this.loadingCarrito[productoId] = false; // Desactiva el loading después de la simulación
    console.log(`Producto ${productoId} agregado al carrito`);
  }, 2000);
}

  ngOnInit(): void {
    this.obtenerProductos();
    this.obtenerFiltros();
    this.searchService.search$.subscribe(text => {
      this.searchText = text;
      this.filtrarProductos();
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

  obtenerProductos(filtros: any = {}): void {
    this.productoService.getAllProductos(1, 10, filtros).subscribe(response => {
      this.productos = response.productos.map(producto => ({
        ...producto,
        TipoProducto: producto.TipoProducto ? producto.TipoProducto : { nombre: 'Sin tipo' },
        tallas: producto.tallasColoresStock
          ? producto.tallasColoresStock.map(tc => tc.talla.talla)
          : []
      }));

      console.log('Productos con tallas:', this.productos); // Verifica en la consola si las tallas están bien estructuradas

      this.filteredProductos = [...this.productos];
      this.filtrarProductos();
    }, error => {
      console.error('Error al obtener productos:', error);
    });
  }

  getTallasDisponibles(producto: any): string {
    if (!producto.tallasColoresStock || producto.tallasColoresStock.length === 0) {
      return 'Sin talla disponible';
    }

    return producto.tallasColoresStock
      .map(tc => tc?.talla?.talla) // Validar que exista `talla`
      .filter(talla => talla) // Eliminar valores `undefined` o `null`
      .join(', ');
  }

  obtenerFiltros(): void {
    this.productoService.getAllFilters().subscribe(response => {
      this.categorias = response.categorias.map(c => ({ ...c, seleccionado: false }));
      this.tiposProductos = response.tipos.map(t => ({ ...t, seleccionado: false }));
      this.marcas = response.marcas.map(m => ({ ...m, seleccionado: false }));
      this.colores = response.colores.map(c => ({ ...c, seleccionado: false }));
      this.tallas = response.tallas.map(t => ({ ...t, seleccionado: false }));
    }, error => {
      console.error('Error al obtener filtros:', error);
    });
  }

  filtrarProductos(): void {
    let productosFiltrados = [...this.productos];

    if (this.searchText.trim() !== '') {
      const searchWords = this.searchText.toLowerCase().split(' ').filter(word => word.length > 2);

      productosFiltrados = productosFiltrados.filter(producto => {
        const nombreProducto = producto.nombre?.toLowerCase() || '';
        const tipoProducto = producto.TipoProducto?.nombre?.toLowerCase() || '';

        return searchWords.every(word =>
          nombreProducto.includes(word) || tipoProducto.includes(word)
        );
      });
    }

    const categoriasSeleccionadas = this.categorias.filter(c => c.seleccionado).map(c => c.id);
    if (categoriasSeleccionadas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        categoriasSeleccionadas.includes(producto.categoria_id)
      );
    }

    const tiposSeleccionados = this.tiposProductos.filter(t => t.seleccionado).map(t => t.id);
    if (tiposSeleccionados.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        tiposSeleccionados.includes(producto.tipo_id)
      );
    }

    const marcasSeleccionadas = this.marcas.filter(m => m.seleccionado).map(m => m.id);
    if (marcasSeleccionadas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        marcasSeleccionadas.includes(producto.marca_id)
      );
    }

    const tallasSeleccionadas = this.tallas.filter(t => t.seleccionado).map(t => t.talla);
    if (tallasSeleccionadas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.tallas.some(talla => tallasSeleccionadas.includes(talla))
      );
    }

    const coloresSeleccionados = this.colores.filter(c => c.seleccionado).map(c => c.id);
    if (coloresSeleccionados.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.tallasColoresStock?.some(tc => coloresSeleccionados.includes(tc.coloresStock.id))
      );
    }
    this.filteredProductos = productosFiltrados;
  }

  toggleFiltros(): void {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  toggleColor(color: any): void {
    color.seleccionado = !color.seleccionado;
    this.filtrarProductos();
  }

  toggleSeccion(seccion: string): void {
    if (seccion === 'colores') this.coloresVisibles = !this.coloresVisibles;
    if (seccion === 'categoria') this.categoriaVisibles = !this.categoriaVisibles;
    if (seccion === 'tipoProducto') this.tipoProductoVisibles = !this.tipoProductoVisibles;
    if (seccion === 'marca') this.marcaVisibles = !this.marcaVisibles;
    if (seccion === 'talla') this.tallaVisibles = !this.tallaVisibles;
  }
}

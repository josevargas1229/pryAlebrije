import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { DetallesFormComponent } from '../detalles-form/detalles-form.component';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  animations: [
    // Animación para la carga del componente
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px) scale(0.8)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    // Animación para cuando no hay elementos
    trigger('emptyState', [
      state('void', style({ opacity: 0, transform: 'scale(0.5) rotate(-10deg)' })),
      state('*', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      transition('void => *', [
        animate('1000ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.5) rotate(-10deg)', offset: 0 }),
          style({ opacity: 0.5, transform: 'scale(1.2) rotate(5deg)', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 }),
        ])),
      ]),
    ]),
    // Animación para las filas al entrar
    trigger('rowEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('600ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    // Animación para el botón "Añadir"
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' })),
      state('hover', style({ transform: 'scale(1.1) rotate(5deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' })),
      transition('normal <=> hover', animate('300ms ease-in-out')),
    ]),
  ]
})
export class CatalogComponent implements OnInit {
  catalogType!: string;
  displayedColumns: string[] = ['nombre', 'acciones'];
  dataSource: any[] = [];
  isColorCatalog: boolean = false;
  isLoading: boolean = true; // Para controlar la animación de carga

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.catalogType = this.route.snapshot.data['catalogType'];
    
    if (!this.catalogType) {
      console.error('catalogType no definido en la ruta');
      this.snackBar.open('Error: Tipo de catálogo no especificado', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isColorCatalog = this.catalogType === 'color';
    if (this.isColorCatalog) {
      this.displayedColumns = ['nombre', 'hex', 'acciones'];
    }
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.isLoading = true; // Inicia la carga
    const serviceCall = this.getServiceCall(this.catalogType, 'list');
    if (serviceCall) {
      serviceCall.subscribe({
        next: (response) => {
          this.dataSource = response;
          this.isLoading = false; // Termina la carga
        },
        error: (error) => {
          console.error(`Error al cargar ${this.catalogType}:`, error);
          this.snackBar.open(`Error al cargar ${this.catalogType}`, 'Cerrar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  addItem(): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Añadir ${this.catalogType}`, type: this.catalogType },
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.nombre = result.nombre.toUpperCase();
        const serviceCall = this.getServiceCall(this.catalogType, 'create', undefined, result);
        if (serviceCall) {
          serviceCall.subscribe({
            next: () => {
              this.snackBar.open(`${this.catalogType} agregada exitosamente`, 'Cerrar', { duration: 3000 });
              this.loadCatalog();
            },
            error: (error) => {
              console.error(`Error al agregar ${this.catalogType}:`, error);
              this.snackBar.open(`Error al agregar ${this.catalogType}`, 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  editItem(item: any): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Editar ${this.catalogType}`, type: this.catalogType, item },
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.nombre = result.nombre.toUpperCase();
        const serviceCall = this.getServiceCall(this.catalogType, 'update', item.id, result);
        if (serviceCall) {
          serviceCall.subscribe({
            next: () => {
              this.snackBar.open(`${this.catalogType} actualizada exitosamente`, 'Cerrar', { duration: 3000 });
              this.loadCatalog();
            },
            error: (error) => {
              console.error(`Error al actualizar ${this.catalogType}:`, error);
              this.snackBar.open(`Error al actualizar ${this.catalogType}`, 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  getServiceCall(type: string, action: string, id?: number, data?: any) {
    switch (type) {
      case 'categoria':
        if (action === 'list') return this.productoService.getCategorias();
        if (action === 'create') return this.productoService.createCategoria(data.nombre);
        if (action === 'update') return this.productoService.updateCategoria(id!, data.nombre);
        break;
      case 'tipo':
        if (action === 'list') return this.productoService.getTiposProducto();
        if (action === 'create') return this.productoService.createTipoProducto(data.nombre);
        if (action === 'update') return this.productoService.updateTipoProducto(id!, data.nombre);
        break;
      case 'marca':
        if (action === 'list') return this.productoService.getMarcas();
        if (action === 'create') return this.productoService.createMarca(data.nombre);
        if (action === 'update') return this.productoService.updateMarca(id!, data.nombre);
        break;
      case 'talla':
        if (action === 'list') return this.productoService.getTallas();
        if (action === 'create') return this.productoService.createTalla(data.nombre);
        if (action === 'update') return this.productoService.updateTalla(id!, data.nombre);
        break;
      case 'temporada':
        if (action === 'list') return this.productoService.getTemporadas();
        if (action === 'create') return this.productoService.createTemporada(data.nombre);
        if (action === 'update') return this.productoService.updateTemporada(id!, data.nombre);
        break;
      case 'color':
        if (action === 'list') return this.productoService.getColores();
        if (action === 'create') return this.productoService.createColor(data.nombre, data.hex);
        if (action === 'update') return this.productoService.updateColor(id!, data.nombre, data.hex);
        break;
      default:
        return null;
    }
    return null;
  }

  // Estado del botón "Añadir"
  buttonState: string = 'normal';
  onButtonHover(isHover: boolean): void {
    this.buttonState = isHover ? 'hover' : 'normal';
  }
}
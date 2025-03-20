import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { DetallesFormComponent } from '../detalles-form/detalles-form.component';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

interface ServiceCallData {
  nombre?: string;
  hex?: string;
}

interface ServiceActions {
  list: () => any;
  create: (data: ServiceCallData) => any;
  update: (id: number, data: ServiceCallData) => any;
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px) scale(0.8)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
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
    trigger('rowEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('600ms 200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' })),
      state('hover', style({ transform: 'scale(1.1) rotate(5deg)', boxShadow: '0 6px 12px rgba(0,0,0,0.3)' })),
      transition('normal <=> hover', animate('300ms ease-in-out')),
    ]),
  ],
})
export class CatalogComponent implements OnInit {
  catalogType!: string;
  displayedColumns: string[] = ['nombre', 'acciones'];
  dataSource: any[] = [];
  isColorCatalog: boolean = false;
  isLoading: boolean = true;
  buttonState: string = 'normal';

  constructor(
    private readonly productoService: ProductoService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly route: ActivatedRoute
  ) {}

  private serviceMap: Record<string, ServiceActions> = {
    categoria: {
      list: () => this.productoService.getCategorias(),
      create: (data) => this.productoService.createCategoria(data.nombre!),
      update: (id, data) => this.productoService.updateCategoria(id, data.nombre!),
    },
    tipo: {
      list: () => this.productoService.getTiposProducto(),
      create: (data) => this.productoService.createTipoProducto(data.nombre!),
      update: (id, data) => this.productoService.updateTipoProducto(id, data.nombre!),
    },
    marca: {
      list: () => this.productoService.getMarcas(),
      create: (data) => this.productoService.createMarca(data.nombre!),
      update: (id, data) => this.productoService.updateMarca(id, data.nombre!),
    },
    talla: {
      list: () => this.productoService.getTallas(),
      create: (data) => this.productoService.createTalla(data.nombre!),
      update: (id, data) => this.productoService.updateTalla(id, data.nombre!),
    },
    temporada: {
      list: () => this.productoService.getTemporadas(),
      create: (data) => this.productoService.createTemporada(data.nombre!),
      update: (id, data) => this.productoService.updateTemporada(id, data.nombre!),
    },
    color: {
      list: () => this.productoService.getColores(),
      create: (data) => this.productoService.createColor(data.nombre!, data.hex!),
      update: (id, data) => this.productoService.updateColor(id, data.nombre!, data.hex!),
    },
  };

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
    this.isLoading = true;
    const serviceCall = this.getServiceCall(this.catalogType, 'list');
    if (serviceCall) {
      serviceCall.subscribe({
        next: (response) => {
          this.dataSource = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(`Error al cargar ${this.catalogType}:`, error);
          this.snackBar.open(`Error al cargar ${this.catalogType}`, 'Cerrar', { duration: 3000 });
          this.isLoading = false;
        },
      });
    }
  }

  addItem(): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Añadir ${this.catalogType}`, type: this.catalogType },
      autoFocus: true,
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
            },
          });
        }
      }
    });
  }

  editItem(item: any): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Editar ${this.catalogType}`, type: this.catalogType, item },
      autoFocus: true,
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
            },
          });
        }
      }
    });
  }

  getServiceCall(type: string, action: string, id?: number, data?: ServiceCallData) {
    if (!this.serviceMap[type]) {
      return null;
    }

    const actions = this.serviceMap[type];
    const serviceAction = actions[action as keyof ServiceActions];

    if (!serviceAction) {
      return null;
    }

    if (action === 'list') {
      return (serviceAction as () => any)();
    }
    if (action === 'create') {
      return (serviceAction as (data: ServiceCallData) => any)(data || {});
    }
    if (action === 'update') {
      if (id === undefined) {
        return null;
      }
      return (serviceAction as (id: number, data: ServiceCallData) => any)(id, data || {});
    }

    return null;
  }

  onButtonHover(isHover: boolean): void {
    this.buttonState = isHover ? 'hover' : 'normal';
  }
}
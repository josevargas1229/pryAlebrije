import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LowStockService, LowStockProduct, LowStockResponse } from '../services/low-stock.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-low-stock',
  templateUrl: './low-stock.component.html',
  styleUrls: ['./low-stock.component.scss'],
  animations: [
    // Animación para la carga de la tabla
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Animación para expandir/contraer detalles (si decides agregar más info por fila)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    // Animación para el paginador
    trigger('paginatorFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LowStockComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'categoria', 'talla', 'color', 'stock'];
  dataSource = new MatTableDataSource<LowStockProduct>();
  nivelMinimoDefault: number = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private readonly lowStockService: LowStockService) {}

  ngOnInit(): void {
    this.loadLowStockProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; // Vinculamos el paginador al dataSource
  }

  loadLowStockProducts(): void {
    this.lowStockService.getLowStockProducts().subscribe(
      (response: LowStockResponse) => {
        this.dataSource.data = response.productos;
        this.nivelMinimoDefault = response.nivel_minimo_default;
      },
      error => {
        console.error('Error al cargar productos con bajo stock:', error);
      }
    );
  }
}
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgChartsModule } from 'ng2-charts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartType, ChartConfiguration } from 'chart.js';

import { TransaccionesService, Transaccion } from '../services/transacciones/transacciones.service';
import { VentaService } from '../services/ventas/venta.service';

interface ResumenTransacciones {
  aprobadas: number;
  pendientes: number;
  fallidas: number;
  total: number;
}

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    NgChartsModule
  ],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss']
})
export class TransaccionesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Datos de tabla
  displayedColumns: string[] = ['id', 'usuario', 'venta_id', 'estado', 'metodo', 'created_at'];
  dataSource = new MatTableDataSource<Transaccion>();
  selectedTransaction: Transaccion | null = null;

  // Filtros
  filtroEstado: string = '';

  // Resumen
  resumen: ResumenTransacciones = {
    aprobadas: 0,
    pendientes: 0,
    fallidas: 0,
    total: 0
  };

  // Gráficos
  productosLabels: string[] = [];
  productosData: number[] = [];
  ventasDiaLabels: string[] = [];
  ventasDiaData: number[] = [];

  currentChartType: ChartType = 'line';
  currentChartData: { data: number[]; label: string; backgroundColor?: string; borderColor?: string }[] = [];
  currentLabels: string[] = [];
  chartType: 'vendidos' | 'dia' = 'dia';

  rangoSeleccionado: 'semana' | 'mes' | 'año' = 'mes';

  barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#333'
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Cantidad de Ventas',
        color: '#333',
        font: { weight: 'bold', size: 14 }
      },
      ticks: {
        color: '#333'
      },
      grid: {
        color: '#e0e0e0'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Fecha',
        color: '#333',
        font: { weight: 'bold', size: 14 }
      },
      ticks: {
        color: '#333',
        maxRotation: 30,
        minRotation: 0,
        callback: function (value, index, ticks) {
          const label = this.getLabelForValue(value as number);
          const date = new Date(label);
          if (!isNaN(date.getTime())) {
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}`;
          }
          return label;
        }
      },
      grid: {
        color: '#e0e0e0'
      }
    }
  }
};


  constructor(
    private transaccionesService: TransaccionesService,
    private ventaService: VentaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarTransacciones();
    this.cargarEstadisticas();
  }

  cargarTransacciones(): void {
    this.transaccionesService.getTransacciones().subscribe({
      next: (transacciones) => {
        this.dataSource.data = transacciones;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: Transaccion, filter: string): boolean => {
  const f = JSON.parse(filter);
  const estado = data.estado.toLowerCase();
  const texto = f.texto || '';

  const estadoCoincide = f.estado
    ? (f.estado === 'aprobado'
        ? ['aprobado', 'exitoso', 'exitoso_pago'].includes(estado)
        : estado === f.estado)
    : true;

  const textoCoincide =
    data.id.toString().includes(texto) ||
    data.usuario_id.toString().includes(texto) ||
    (data.usuario_id ? data.usuario_id.toString() : '').includes(texto) ||
    data.metodo_pago.toLowerCase().includes(texto) ||
    data.estado.toLowerCase().includes(texto);

  return estadoCoincide && textoCoincide;
};

        this.calcularResumen(transacciones);
      },
      error: (error) => {
        console.error('Error al cargar transacciones:', error);
        this.showMessage('Error al cargar transacciones', 'error');
      }
    });
  }

  calcularResumen(transacciones: Transaccion[]): void {
    this.resumen = {
      aprobadas: transacciones.filter(t => ['aprobado', 'exitoso', 'exitoso_pago'].includes(t.estado.toLowerCase())).length,
      pendientes: transacciones.filter(t => t.estado.toLowerCase() === 'pendiente').length,
      fallidas: transacciones.filter(t => t.estado.toLowerCase() === 'fallido').length,
      total: transacciones.length
    };
  }

  applyFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.dataSource.filter = JSON.stringify({
    estado: this.filtroEstado.toLowerCase(),
    texto: value
  });

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}


  filtrarPorEstado(): void {
  const searchInput = (document.querySelector('input[matinput]') as HTMLInputElement)?.value.trim().toLowerCase() || '';
  this.dataSource.filter = JSON.stringify({
    estado: this.filtroEstado.toLowerCase(),
    texto: searchInput
  });
}


  selectTransaction(transaction: Transaccion): void {
    this.selectedTransaction = transaction;
  }

  recargarTransacciones(): void {
    this.cargarTransacciones();
    this.showMessage('Transacciones actualizadas', 'success');
  }

  exportarTransacciones(): void {
    // Implementar lógica de exportación
    this.showMessage('Exportando transacciones...', 'info');
  }

  cargarEstadisticas(): void {
    this.ventaService.getEstadisticasVentas(this.rangoSeleccionado).subscribe({
      next: (res) => {
        this.productosLabels = res.productosMasVendidos.map((p: any) =>
          p.producto?.tipoProducto?.nombre || `ID ${p.producto_id}`
        );
        this.productosData = res.productosMasVendidos.map((p: any) =>
          Number(p.totalVendidas)
        );

        const campo = this.rangoSeleccionado === 'semana' ? 'semana' :
                     this.rangoSeleccionado === 'año' ? 'mes' : 'dia';

        this.ventasDiaLabels = res.ventasAgrupadas.map((v: any) => v[campo]);
        this.ventasDiaData = res.ventasAgrupadas.map((v: any) => Number(v.total));

        this.setChart(this.chartType);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.showMessage('Error al cargar estadísticas', 'error');
      }
    });
  }

  cambiarTipoGrafico(event: any): void {
    this.chartType = event.value;
    this.setChart(this.chartType);
  }

  setChart(tipo: 'vendidos' | 'dia'): void {
    if (tipo === 'vendidos') {
      this.currentChartType = 'bar';
      this.currentChartData = [
        {
          data: this.productosData,
          label: 'Productos más vendidos',
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: 'rgba(25, 118, 210, 1)'
        }
      ];
      this.currentLabels = this.productosLabels;
    } else {
      this.currentChartType = 'line';
      this.currentChartData = [
  {
    data: this.ventasDiaData,
    label: `Ventas por ${this.rangoSeleccionado}`,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 1)'
  }
];

      this.currentLabels = this.ventasDiaLabels;
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
     case 'exitoso':
case 'exitoso_pago':
case 'aprobado':
  return '#4caf50';

      case 'fallido':
        return '#f44336';
      case 'pendiente':
        return '#ff9800';
      default:
        return '#666';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'exitoso':
case 'exitoso_pago':
case 'aprobado':
  return 'check_circle';

      case 'fallido':
        return 'error';
      case 'pendiente':
        return 'schedule';
      default:
        return 'help';
    }
  }

  getMetodoIcon(metodo: string): string {
    switch (metodo.toLowerCase()) {
      case 'tarjeta':
      case 'credit_card':
        return 'credit_card';
      case 'paypal':
        return 'payment';
      case 'transferencia':
      case 'bank_transfer':
        return 'account_balance';
      case 'efectivo':
      case 'cash':
        return 'payments';
      default:
        return 'payment';
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  normalizarEstado(estado: string): string {
  const e = estado.toLowerCase();
  if (['aprobado', 'exitoso', 'exitoso_pago'].includes(e)) return 'Aprobado';
  if (e === 'pendiente') return 'Pendiente';
  if (e === 'fallido') return 'Fallido';
  return estado;
}

}

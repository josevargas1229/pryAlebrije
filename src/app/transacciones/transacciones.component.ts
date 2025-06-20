import { VentaService } from './../services/ventas/venta.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TransaccionesService } from '../services/transacciones/transacciones.service';
import { ChartType, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

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
    NgChartsModule
  ],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss']
})
export class TransaccionesComponent implements OnInit {
  productosLabels: string[] = [];
  productosData: number[] = [];
  ventasDiaLabels: string[] = [];
  ventasDiaData: number[] = [];

  currentChartType: ChartType = 'line';
  currentChartData: { data: number[]; label: string }[] = [{ data: [], label: '' }];
  currentLabels: string[] = [];

  rangoSeleccionado: 'semana' | 'mes' | 'año' = 'mes';

  barChartOptions: ChartConfiguration['options'] = { responsive: true };

  displayedColumns: string[] = ['id', 'usuario', 'venta_id', 'estado', 'metodo', 'created_at'];
  transacciones: any[] = [];

  constructor(
    private transaccionesService: TransaccionesService,
    private VentaService: VentaService
  ) {}

  ngOnInit(): void {
    this.transaccionesService.getTransacciones().subscribe({
      next: (res) => (this.transacciones = res),
      error: (err) => console.error('Error al obtener transacciones', err)
    });

    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.VentaService.getEstadisticasVentas(this.rangoSeleccionado).subscribe({
      next: (res) => {
        this.productosLabels = res.productosMasVendidos.map((p: any) =>
          p.producto?.tipoProducto?.nombre || `ID ${p.producto_id}`
        );
        this.productosData = res.productosMasVendidos.map((p: any) =>
          Number(p.totalVendidas)
        );

        const campo =
          this.rangoSeleccionado === 'semana'
            ? 'semana'
            : this.rangoSeleccionado === 'año'
            ? 'mes'
            : 'dia';

        this.ventasDiaLabels = res.ventasAgrupadas.map((v: any) => v[campo]);
        this.ventasDiaData = res.ventasAgrupadas.map((v: any) =>
          Number(v.total)
        );

        this.setChart('dia');
      },
      error: (err) => console.error('Error estadísticas ventas', err)
    });
  }

  setChart(tipo: 'vendidos' | 'dia') {
    if (tipo === 'vendidos') {
      this.currentChartType = 'bar';
      this.currentChartData = [
        { data: this.productosData, label: 'Más vendidos' }
      ];
      this.currentLabels = this.productosLabels;
    } else {
      this.currentChartType = 'line';
      this.currentChartData = [
        {
          data: this.ventasDiaData,
          label: 'Ventas por ' + this.rangoSeleccionado
        }
      ];
      this.currentLabels = this.ventasDiaLabels;
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return 'green';
      case 'fallido':
        return 'red';
      case 'pendiente':
        return 'orange';
      default:
        return 'black';
    }
  }
}

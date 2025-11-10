import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ReportesGamificacionService, GamificacionReporteDTO } from './reportes-gamificacion.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reportes-gamificacion',
  templateUrl: './reportes-gamificacion.component.html',
  styleUrls: ['./reportes-gamificacion.component.scss']
})
export class ReportesGamificacionComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = false;
  error = '';

  data: GamificacionReporteDTO | null = null;

  @ViewChild('girosChart') girosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('premiosChart') premiosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cuponesChart') cuponesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('acumuladoChart') acumuladoChartRef!: ElementRef<HTMLCanvasElement>; // <--- NUEVO

  private girosChart?: Chart;
  private premiosChart?: Chart;
  private cuponesChart?: Chart;
  private acumuladoChart?: Chart; // <--- NUEVO

  private viewReady = false;

  from: string | null = null;
  to: string | null = null;

  constructor(private api: ReportesGamificacionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.data) {
      setTimeout(() => this.buildCharts(), 0);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts() {
    this.girosChart?.destroy();
    this.premiosChart?.destroy();
    this.cuponesChart?.destroy();
    this.acumuladoChart?.destroy();   // <--- NUEVO

    this.girosChart = undefined;
    this.premiosChart = undefined;
    this.cuponesChart = undefined;
    this.acumuladoChart = undefined;  // <--- NUEVO
  }

  applyFilter(): void {
    this.loadData();
  }

  resetFilter(): void {
    this.from = null;
    this.to = null;
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.error = '';
    this.destroyCharts();

    this.api.getReporte(this.from || undefined, this.to || undefined).subscribe({
      next: (r) => {
        this.data = r;
        this.loading = false;

        if (this.viewReady) {
          setTimeout(() => this.buildCharts(), 0);
        }
      },
      error: (e) => {
        this.error = e?.error?.message || 'Error al cargar reportes.';
        this.loading = false;
      }
    });
  }

  private buildCharts(): void {
    if (!this.data) return;

    this.destroyCharts();

    // ---------- GIROS POR DÍA ----------
    const girosLabels = this.data.girosPorDia.map(d => d.dia);
    const girosValues = this.data.girosPorDia.map(d => d.giros);

    if (this.girosChartRef) {
      this.girosChart = new Chart(this.girosChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: girosLabels,
          datasets: [{
            label: 'Giros por día',
            data: girosValues,
            fill: false,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    // ---------- PREMIOS TOP ----------
    const premiosLabels = this.data.premiosTop.map(p => p.nombre);
    const premiosValues = this.data.premiosTop.map(p => p.veces);

    if (this.premiosChartRef) {
      this.premiosChart = new Chart(this.premiosChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: premiosLabels,
          datasets: [{
            label: 'Premios más entregados',
            data: premiosValues
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    // ---------- CUPONES USADOS POR DÍA ----------
    const cuponesLabels = this.data.cuponesPorDia.map(d => d.dia);
    const cuponesValues = this.data.cuponesPorDia.map(d => d.usados);

    if (this.cuponesChartRef) {
      this.cuponesChart = new Chart(this.cuponesChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: cuponesLabels,
          datasets: [{
            label: 'Cupones usados por día',
            data: cuponesValues,
            fill: false,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    // ---------- GIROS TOTALES ACUMULADOS ----------
    if (this.acumuladoChartRef && girosValues.length) {
      const acumuladoLabels = girosLabels;
      const acumuladoValues: number[] = [];
      let acc = 0;
      for (const v of girosValues) {
        acc += v;
        acumuladoValues.push(acc);
      }

      this.acumuladoChart = new Chart(this.acumuladoChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: acumuladoLabels,
          datasets: [{
            label: 'Giros totales acumulados',
            data: acumuladoValues,
            fill: true,
            tension: 0.25
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  get totalGiros(): number {
    return this.data?.resumen.girosTotales ?? 0;
  }

  get totalCuponesUsados(): number {
    return this.data?.resumen.cuponesUsados ?? 0;
  }
}

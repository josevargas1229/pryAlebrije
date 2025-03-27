import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-client-growth',
  templateUrl: './client-grow.component.html',
  styleUrls: ['./client-grow.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ClientGrowComponent implements OnInit {
  M = 10214; // Límite máximo de clientes
  C0 = 10; // Clientes iniciales
  k = 0.005; // Tasa de crecimiento
  p = 30; // Probabilidad de conversión inicial (en porcentaje)
  days = 60; // Días iniciales
  clients: number[] = [];
  sales: number[] = [];
  chart: Chart | undefined;

  ngOnInit() {
    this.calculateGrowth();
    this.renderChart();
  }

  // Calcular crecimiento de clientes y ventas
  calculateGrowth() {
    this.clients = [];
    this.sales = [];
    const pDecimal = this.p / 100; // Convertir porcentaje a decimal
    for (let t = 0; t <= this.days; t++) {
      const Ct = this.M - (this.M - this.C0) * Math.exp(-this.k * t);
      this.clients.push(Math.round(Ct));
      this.sales.push(Math.round(Ct * pDecimal));
    }
  }

  // Renderizar gráfico
  renderChart() {
    if (this.chart) this.chart.destroy();
    const ctx = document.getElementById('growthChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: this.days + 1 }, (_, i) => i.toString()),
        datasets: [
          {
            label: 'Clientes alcanzados',
            data: this.clients,
            borderColor: '#3f51b5',
            backgroundColor: '#3f51b5',
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Ventas potenciales',
            data: this.sales,
            borderColor: '#ff4081',
            backgroundColor: '#ff4081',
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad',
        },
        scales: {
          x: { title: { display: true, text: 'Días (t)' } },
          y: { title: { display: true, text: 'Cantidad' } },
        },
      },
    });
  }

  // Actualizar valores dinámicamente
  updateValues() {
    this.calculateGrowth();
    this.renderChart();
  }
}
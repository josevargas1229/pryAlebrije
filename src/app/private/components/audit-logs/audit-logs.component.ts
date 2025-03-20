import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AuditLog, HistorialService } from '../../services/historial/historial.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
  animations: [
    // Animación para las filas al entrar
    trigger('rowEnter', [
      transition(':enter', [
        animate('1s ease-in-out', keyframes([
          style({ opacity: 0, transform: 'translateX(-100%) scale(0.5)', offset: 0 }),
          style({ opacity: 0.5, transform: 'translateX(50%) scale(1.2)', offset: 0.5 }),
          style({ opacity: 1, transform: 'translateX(0) scale(1)', offset: 1 })
        ]))
      ])
    ]),
    // Animación para el mensaje de "No hay datos"
    trigger('noDataAnimation', [
      state('in', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      transition(':enter', [
        animate('1.5s ease-in-out', keyframes([
          style({ opacity: 0, transform: 'translateY(-50%) scale(0.5) rotate(0deg)', offset: 0 }),
          style({ opacity: 0.7, transform: 'translateY(20%) scale(1.3) rotate(360deg)', offset: 0.5 }),
          style({ opacity: 1, transform: 'translateY(0) scale(1) rotate(0deg)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class AuditLogsComponent implements OnInit {
  modulo: string = '';
  displayedColumns: string[] = ['timestamp', 'nombre_usuario', 'rol', 'accion', 'detalle'];
  dataSource = new MatTableDataSource<AuditLog>();

  constructor(
    private readonly auditLogService: HistorialService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.modulo = data['modulo'] || '';
      if (this.modulo) {
        this.loadLogs();
      } else {
        console.warn('No se proporcionó un módulo para los logs de auditoría.');
      }
    });
  }

  loadLogs(): void {
    this.auditLogService.getAuditLogs(this.modulo).subscribe(
      (logs: AuditLog[]) => {
        this.dataSource.data = logs;
      },
      error => {
        console.error(`Error al cargar los logs del módulo ${this.modulo}:`, error);
      }
    );
  }

  getDetalleSummary(detalle: string): string {
    try {
      const parsed = JSON.parse(detalle);
      const { producto_id, datos, variantes, imagenes_eliminadas, nuevas_imagenes } = parsed;
      let summary = `Producto: ${producto_id}`;
      if (datos) {
        summary += `, Precio: ${datos.precio}, Estado: ${datos.estado}`;
      }
      if (variantes && variantes.length > 0) {
        summary += `, Variantes: ${variantes.length}`;
      }
      if (imagenes_eliminadas && imagenes_eliminadas.length > 0) {
        summary += `, Imágenes eliminadas: ${imagenes_eliminadas.length}`;
      }
      if (nuevas_imagenes && nuevas_imagenes.length > 0) {
        summary += `, Nuevas imágenes: ${nuevas_imagenes.length}`;
      }
      return summary;
    } catch (e) {
      return 'Detalles no disponibles';
    }
  }

  parseDetalle(detalle: string): string {
    try {
      const parsed = JSON.parse(detalle);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return detalle;
    }
  }
}
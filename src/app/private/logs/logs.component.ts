import { Component, OnInit } from '@angular/core';
import { LogsService } from '../services/logs/logs.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  logs: any[] = []; // Cambiar a un array de objetos
  cargando = false;

  constructor(private readonly logsService: LogsService, private readonly snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;
    this.logsService.obtenerLogs().subscribe(
      (data) => {
        this.logs = data.logs; // Asignar directamente el array de logs
        this.cargando = false;
      },
      (error) => {
        this.mostrarError('Error al cargar los logs');
        console.error('Error al cargar los logs', error);
        this.cargando = false;
      }
    );
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}

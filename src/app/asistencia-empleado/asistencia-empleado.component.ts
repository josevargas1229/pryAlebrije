import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AsistenciaService } from '../private/services/asistencia.service';

@Component({
  selector: 'app-asistencia-empleado',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ZXingScannerModule
  ],
  templateUrl: './asistencia-empleado.component.html',
  styleUrls: ['./asistencia-empleado.component.scss']
})
export class AsistenciaEmpleadoComponent implements OnInit {
  allowedFormats = [BarcodeFormat.QR_CODE];
  scanSuccess = false;
  errorMessage = '';
  isEntrada = true;
  asistencias: any[] = [];

  constructor(private asistenciaService: AsistenciaService) { }

  ngOnInit(): void {
    this.cargarAsistencias();
  }

  onScanSuccess(result: string) {
    try {
      const qrData = JSON.parse(result);
      if (qrData.ubicacion !== 'tienda_fisica') {
        this.errorMessage = 'QR no válido para esta ubicación';
        return;
      }

      const empleadoId = this.getEmpleadoIdFromAuth();
      const now = new Date().toISOString();
      const data = {
        empleado_id: empleadoId,
        hora_entrada: this.isEntrada ? now : null,
        hora_salida: !this.isEntrada ? now : null,
        estado: 'presente',
        notas: 'Registrado vía QR',
        qr_data: qrData
      };

      this.asistenciaService.registrarAsistencia(data).subscribe({
        next: (response) => {
          this.scanSuccess = true;
          this.errorMessage = '';
          this.cargarAsistencias();
          // Resetear el estado de éxito después de 3 segundos
          setTimeout(() => {
            this.scanSuccess = false;
          }, 3000);
        },
        error: (err) => {
          // Mostrar el mensaje de error específico del backend
          this.errorMessage = err.error?.error || 'Error al registrar: ' + err.message;
        }
      });
    } catch (error) {
      this.errorMessage = 'QR inválido';
    }
  }

  toggleTipo() {
    this.isEntrada = !this.isEntrada;
  }

  private getEmpleadoIdFromAuth(): number {
    const user = { empleado_id: 2 };
    return user?.empleado_id || 0;
  }

  cargarAsistencias() {
    const empleadoId = this.getEmpleadoIdFromAuth();
    if (empleadoId) {
      this.asistenciaService.obtenerPorEmpleado(empleadoId).subscribe({
        next: (data) => this.asistencias = data,
        error: (err) => console.error('Error cargando asistencias:', err)
      });
    }
  }
}
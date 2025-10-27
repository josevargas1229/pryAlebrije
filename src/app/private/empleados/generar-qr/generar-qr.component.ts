import { Component, OnInit } from '@angular/core';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.component.html',
  styleUrls: ['./generar-qr.component.scss']
})
export class GenerarQrComponent implements OnInit {
  qrDataUrl: string | null = null;
  isDownloading: boolean = false;
  isLoading: boolean = true;

  constructor(private asistenciaService: AsistenciaService) { }

  ngOnInit(): void {
    this.generarQr();
  }

  generarQr(): void {
    this.isLoading = true;
    this.asistenciaService.generarQRTienda().subscribe(
      (data) => {
        this.qrDataUrl = data.qr_data_url;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al generar QR', error);
        this.isLoading = false;
      }
    );
  }

  descargarQr(): void {
    if (this.qrDataUrl && !this.isDownloading) {
      this.isDownloading = true;
      
      // Simular un pequeño delay para la animación
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = this.qrDataUrl!;
        link.download = 'qr-tienda.png';
        link.click();
        
        // Resetear el estado después de la animación
        setTimeout(() => {
          this.isDownloading = false;
        }, 1500);
      }, 300);
    }
  }
}
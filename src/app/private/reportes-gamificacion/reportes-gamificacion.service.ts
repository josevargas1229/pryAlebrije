import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface GirosPorDiaDTO {
  dia: string;
  giros: number;
}

export interface PremioTopDTO {
  premioId: number;
  nombre: string;
  veces: number;
}

export interface CuponesPorDiaDTO {
  dia: string;
  usados: number;
}

export interface GamificacionReporteDTO {
  rango: { from: string; to: string };
  resumen: { girosTotales: number; cuponesUsados: number };
  girosPorDia: GirosPorDiaDTO[];
  premiosTop: PremioTopDTO[];
  cuponesPorDia: CuponesPorDiaDTO[];
}

@Injectable({ providedIn: 'root' })
export class ReportesGamificacionService {
  private base = environment.API_URL;

  constructor(private http: HttpClient) {}

  getReporte(from?: string, to?: string): Observable<GamificacionReporteDTO> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<GamificacionReporteDTO>(
      `${this.base}/reportes/gamificacion`,
      { params, withCredentials: true }
    );
  }
}

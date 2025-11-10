import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { RuletaDTO, SegmentoRuletaDTO } from './models';

@Injectable({ providedIn: 'root' })
export class RuletaPremiosAdminService {
  private base = environment.API_URL;

  constructor(private http: HttpClient) {}

  listRuletas(): Observable<RuletaDTO[]> {
    return this.http.get<RuletaDTO[]>(`${this.base}/ruletas`, { withCredentials: true });
  }

  listSegmentos(ruletaId: number): Observable<SegmentoRuletaDTO[]> {
    return this.http.get<SegmentoRuletaDTO[]>(
      `${this.base}/ruletapremios/ruletas/${ruletaId}/segmentos`,
      { withCredentials: true }
    );
  }

  createSegmento(
    ruletaId: number,
    body: { premio_id: number; probabilidad_pct: number; activo?: boolean }
  ): Observable<SegmentoRuletaDTO> {
    return this.http.post<SegmentoRuletaDTO>(
      `${this.base}/ruletapremios/ruletas/${ruletaId}/segmentos`,
      body,
      { withCredentials: true }
    );
  }

  updateSegmento(
    ruletaId: number,
    id: number,
    body: Partial<{ probabilidad_pct: number; activo: boolean }>
  ): Observable<SegmentoRuletaDTO> {
    return this.http.put<SegmentoRuletaDTO>(
      `${this.base}/ruletapremios/ruletas/${ruletaId}/segmentos/${id}`,
      body,
      { withCredentials: true }
    );
  }

  deleteSegmento(ruletaId: number, id: number) {
    return this.http.delete(
      `${this.base}/ruletapremios/ruletas/${ruletaId}/segmentos/${id}`,
      { withCredentials: true }
    );
  }
}

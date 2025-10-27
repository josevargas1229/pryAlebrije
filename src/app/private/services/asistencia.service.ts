import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AsistenciaService {
    private apiUrl = `${environment.API_URL}/asistencias`;

    constructor(private http: HttpClient) { }

    // Registrar asistencia (POST /asistencias/registrar)
    registrarAsistencia(asistenciaData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/registrar`, asistenciaData, {
            withCredentials: true
        });
    }

    // Obtener asistencias por empleado (GET /asistencias/empleado/:empleado_id)
    obtenerPorEmpleado(empleadoId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/empleado/${empleadoId}`, {
            withCredentials: true
        });
    }

    // Actualizar asistencia (PATCH /asistencias/:id)
    actualizarAsistencia(id: number, asistenciaData: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, asistenciaData, {
            withCredentials: true
        });
    }

    // Eliminar asistencia (DELETE /asistencias/:id)
    eliminarAsistencia(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, {
            withCredentials: true
        });
    }

    // Generar QR para tienda (GET /asistencias/generar-qr)
    generarQRTienda(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/generar-qr`, {
            withCredentials: true
        });
    }
}
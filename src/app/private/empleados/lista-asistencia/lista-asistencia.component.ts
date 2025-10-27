import { Component, OnInit } from '@angular/core';
import { AsistenciaService } from '../../services/asistencia.service';

@Component({
  selector: 'app-lista-asistencia',
  templateUrl: './lista-asistencia.component.html',
  styleUrls: ['./lista-asistencia.component.scss']
})
export class ListaAsistenciaComponent implements OnInit {
  asistencias: any[] = [];
  empleadoId: number = 0;

  constructor(private asistenciaService: AsistenciaService) { }

  ngOnInit(): void {
    this.empleadoId = 1;
    this.cargarAsistencias();
  }

  cargarAsistencias(): void {
    this.asistenciaService.obtenerPorEmpleado(this.empleadoId).subscribe(
      (data) => this.asistencias = data,
      (error) => console.error('Error al cargar asistencias', error)
    );
  }
}
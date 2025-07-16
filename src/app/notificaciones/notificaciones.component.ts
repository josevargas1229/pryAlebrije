import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificacionService, Notificacion } from '../services/notificacion/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    NgFor,
    NgIf
  ],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  cargando = true;

  constructor(private notiService: NotificacionService) {}

  ngOnInit(): void {
    this.notiService.getNotificaciones().subscribe({
      next: (res) => {
        this.notificaciones = res.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}

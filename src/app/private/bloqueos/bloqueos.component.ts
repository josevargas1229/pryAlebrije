import { Component, OnInit } from '@angular/core';
import { BloqueosService } from '../services/bloqueos/bloqueos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Usuario {
  id: number; // ID del historial de bloqueos
  account_id: number; // ID de la cuenta
  fechaBloqueo: Date; // Fecha de bloqueo
  totalBloqueos: number; // Total de bloqueos
  cuenta: {
    nombre_usuario: string; // Nombre del usuario
  };
}

@Component({
  selector: 'app-bloqueos',
  templateUrl: './bloqueos.component.html',
  styleUrls: ['./bloqueos.component.scss']
})
export class BloqueosComponent implements OnInit {
  usuariosBloqueados: Usuario[] = [];
  usuariosRecientes: Usuario[] = [];
  periodo: string = 'dia';
  bloqueoForm: FormGroup;
  cargandoBloqueados = false;
  cargandoRecientes = false;
  
  constructor(
    private readonly bloqueosService: BloqueosService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {
    this.bloqueoForm = this.fb.group({
      cantidad: ['', [Validators.required, Validators.min(1)]],
      dias: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarUsuariosBloqueados();
    
    // Escuchar cambios en el formulario para cargar usuarios recientes
    this.bloqueoForm.valueChanges.subscribe(() => {
      if (this.bloqueoForm.valid) {
        this.cargarUsuariosRecientes();
      }
    });
  }

  cargarUsuariosBloqueados(): void {
    this.cargandoBloqueados = true;
    this.bloqueosService.obtenerUsuariosBloqueados(this.periodo).subscribe(
      (data) => {
        this.usuariosBloqueados = data;
        this.cargandoBloqueados = false;
      },
      (error) => {
        this.mostrarError('Error al cargar usuarios bloqueados');
        console.error('Error al cargar usuarios bloqueados', error);
        this.cargandoBloqueados = false;
      }
    );
  }

  cargarUsuariosRecientes(): void {
    const { dias, cantidad } = this.bloqueoForm.value;
    if (!dias || !cantidad) return;

    this.cargandoRecientes = true;
    this.bloqueosService.obtenerBloqueosRecientes(dias, cantidad).subscribe(
      (data) => {
        this.usuariosRecientes = data;
        this.cargandoRecientes = false;
      },
      (error) => {
        this.mostrarError('Error al cargar usuarios recientes');
        console.error('Error al cargar usuarios recientes', error);
        this.cargandoRecientes = false;
      }
    );
  }

  bloquearUsuario(userId: number): void {
    this.bloqueosService.bloquearUsuario(userId).subscribe(
      () => {
        this.mostrarExito('Usuario bloqueado exitosamente');
        this.cargarUsuariosRecientes();
        this.cargarUsuariosBloqueados();
      },
      (error) => {
        this.mostrarError('Error al bloquear usuario');
        console.error('Error al bloquear usuario', error);
      }
    );
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}

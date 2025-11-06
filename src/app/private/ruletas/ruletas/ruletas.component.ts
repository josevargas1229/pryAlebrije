import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'angular-toastify';
import { RuletaFormComponent } from '../ruleta-form/ruleta-form.component';
import { RuletaService } from '../ruleta.service';

@Component({
  selector: 'app-ruletas',
  templateUrl: './ruletas.component.html',
  styleUrl: './ruletas.component.scss'
})
export class RuletasComponent implements OnInit {
  ruletas: any[] = [];
  columns = ['imagen_ruleta', 'imagen_background', 'activo', 'created_at', 'acciones'];

  constructor(
    private service: RuletaService, 
    private dialog: MatDialog, 
    private toast: ToastService
  ) {}

  ngOnInit() { 
    this.cargar(); 
  }

  cargar() { 
  this.service.getAll().subscribe({
    next: data => this.ruletas = data,
    error: () => this.toast.error('Error al cargar ruletas')
  });
}

  openForm(ruleta?: any) {
    const dialogRef = this.dialog.open(RuletaFormComponent, { 
      data: ruleta,
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(result => { 
      if (result) this.cargar(); 
    });
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta ruleta?')) {
      this.service.delete(id).subscribe(
        () => { 
          this.toast.success('Ruleta eliminada correctamente'); 
          this.cargar(); 
        }, 
        err => this.toast.error('Error al eliminar la ruleta')
      );
    }
  }
}
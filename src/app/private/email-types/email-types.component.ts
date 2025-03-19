import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmailManagementService } from '../services/email-management/email-management.service.service';
import { EmailTypeDialogComponent } from '../email-type-dialog/email-type-dialog.component';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-email-types',
  templateUrl: './email-types.component.html',
  styleUrls: ['./email-types.component.scss']
})
export class EmailTypesComponent implements OnInit {
  types: any[] = [];  // Lista de tipos de correo

  constructor(
    private readonly emailService: EmailManagementService,
    private readonly dialog: MatDialog,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEmailTypes(); // Cargar tipos de correo al inicializar
  }

  // Cargar todos los tipos de correo
  loadEmailTypes() {
    this.emailService.getAllTypes().subscribe((response: any) => {
      this.types = response.data;
    });
  }

  // Abrir diálogo para crear un nuevo tipo de correo
  openTypeForm() {
    const dialogRef = this.dialog.open(EmailTypeDialogComponent, {
      width: '400px',
      data: {} // Sin datos, ya que es una creación
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamada al servicio para crear el nuevo tipo de correo en el backend
        this.emailService.createType(result).subscribe(
          (result: any) => {
            this.toastService.success("El tipo de correo se creó exitosamente.");
            this.loadEmailTypes();
          },
          (error) => {
            console.error('Error al crear el tipo de correo:', error);
            this.toastService.error("Hubo un error al crear el tipo de correo.");
          }
        );
      }
    });
  }

  // Abrir diálogo para editar un tipo existente
  editType(type: any) {
    const dialogRef = this.dialog.open(EmailTypeDialogComponent, {
      width: '400px',
      data: { ...type, editMode: true } // Pasar los datos existentes para edición
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamada al servicio para actualizar el tipo de correo
        this.emailService.updateType(type.id, result).subscribe(
          (result: any) => {
            this.toastService.success("El tipo de correo se actualizó exitosamente.");
            this.loadEmailTypes();
          },
          (error) => {
            console.error('Error al actualizar el tipo de correo:', error);
            this.toastService.error("Hubo un error al actualizar el tipo de correo.");
          }
        );
      }
    });
  }

  // Ver detalles de un tipo de correo (sin editar)
  viewTypeDetails(type: any) {
    this.dialog.open(EmailTypeDialogComponent, {
      width: '400px',
      data: { ...type, viewMode: true } // Pasar los datos para solo visualización
    });
  }

  // Eliminar un tipo de correo
  deleteType(type: any) {
    if (confirm(`¿Estás seguro de que deseas eliminar el tipo de correo ${type.nombre}?`)) {
      this.emailService.deleteType(type.id).subscribe(
        () => {
          this.toastService.success("El tipo de correo se eliminó exitosamente.");
          this.loadEmailTypes();
        },
        (error) => {
          console.error('Error al eliminar el tipo de correo:', error);
          this.toastService.error("Hubo un error al eliminar el tipo de correo.");
        }
      );
    }
  }
}

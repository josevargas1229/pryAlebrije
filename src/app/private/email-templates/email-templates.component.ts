import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmailTemplateDialogComponent } from '../email-template-dialog/email-template-dialog.component';
import { ToastService } from 'angular-toastify';
import { EmailManagementService } from '../services/email-management/email-management.service.service';

@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.component.html',
  styleUrls: ['./email-templates.component.scss']
})
export class EmailTemplatesComponent implements OnInit {
  templates: any[] = [];  // Lista de plantillas de correo

  constructor(
    private readonly emailService: EmailManagementService,
    private readonly dialog: MatDialog,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEmailTemplates(); // Cargar plantillas al inicializar
  }

  // Cargar todas las plantillas de correo
  loadEmailTemplates() {
    this.emailService.getAllTemplates().subscribe((response: any) => {
      this.templates = response.data;
    });
  }

  // Abrir diálogo para crear una nueva plantilla de correo
  openTemplateForm() {
    const dialogRef = this.dialog.open(EmailTemplateDialogComponent, {
      width: '400px',
      data: {} // Sin datos, creación de una nueva
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamada al servicio para crear la nueva plantilla de correo
        console.log(result)
        this.emailService.createTemplate(result).subscribe(
          (response: any) => {
            this.templates.push(response.data);  // Agregar nueva plantilla a la lista
            this.toastService.success("La plantilla de correo se creó exitosamente.");
            this.loadEmailTemplates();
          },
          (error) => {
            console.error('Error al crear la plantilla de correo:', error);
            this.toastService.error("Hubo un error al crear la plantilla de correo.");
          }
        );
      }
    });
  }

  // Abrir diálogo para editar una plantilla existente
  editTemplate(template: any) {
    const dialogRef = this.dialog.open(EmailTemplateDialogComponent, {
      width: '400px',
      data: { ...template, editMode: true } // Pasar datos existentes para edición
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamada al servicio para actualizar la plantilla de correo
        this.emailService.updateTemplate(template.id, result).subscribe(
          (response: any) => {
            // Actualizar la lista con los datos actualizados
            const index = this.templates.findIndex(t => t.id === template.id);
            if (index !== -1) {
              this.templates[index] = response.data;
            }
            this.toastService.success("La plantilla de correo se actualizó exitosamente.");
            this.loadEmailTemplates();
          },
          (error) => {
            console.error('Error al actualizar la plantilla de correo:', error);
            this.toastService.error("Hubo un error al actualizar la plantilla de correo.");
          }
        );
      }
    });
  }

  // Ver detalles de una plantilla de correo (sin editar)
  viewTemplateDetails(template: any) {
    this.dialog.open(EmailTemplateDialogComponent, {
      width: '400px',
      data: { ...template, viewMode: true } // Modo solo visualización
    });
  }

  // Eliminar una plantilla de correo
  deleteTemplate(template: any) {
    if (confirm(`¿Estás seguro de que deseas eliminar la plantilla de correo ${template.nombre}?`)) {
      this.emailService.deleteTemplate(template.id).subscribe(
        () => {
          this.templates = this.templates.filter(t => t.id !== template.id); // Eliminar de la lista local
          this.toastService.success("La plantilla de correo se eliminó exitosamente.");
          this.loadEmailTemplates();
        },
        (error) => {
          console.error('Error al eliminar la plantilla de correo:', error);
          this.toastService.error("Hubo un error al eliminar la plantilla de correo.");
        }
      );
    }
  }
}

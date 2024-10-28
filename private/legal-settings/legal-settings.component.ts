import { Component } from '@angular/core';
import { LegalService } from '../services/legal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-legal-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './legal-settings.component.html',
  styleUrls: ['./legal-settings.component.scss']
})
export class LegalSettingsComponent {
  selectedTab: string = 'terminos';
  legalContent = { terminos: '', privacidad: '', deslinde: '' };
  savedDocuments: any = { terminos: [], privacidad: [], deslinde: [] };
  selectedFile: File | null = null;
  documentToEdit: any | null = null; // Para almacenar el documento seleccionado para editar

  constructor(
    private legalService: LegalService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.route.queryParams.subscribe(params => {
      this.selectedTab = params['tab'] || 'terminos';
    });
    this.loadLegalDocuments();
  }

  loadLegalDocuments() {
    this.loadDocumentByType('terminos');
    this.loadDocumentByType('privacidad');
    this.loadDocumentByType('deslinde');
  }

  private loadDocumentByType(type: string) {
    this.legalService.getDocumentsByType(type).subscribe(
      (documents: any) => {
        this.savedDocuments[type] = Array.isArray(documents) ? documents : [];
      },
      error => this.handleError(type, error)
    );
  }

  private handleError(documentType: string, error: any) {
    console.error(`Error al cargar ${documentType}:`, error);
    this.toastService.error(`Hubo un error al cargar ${documentType}.`);
  }

  saveDocument(type: string) {
    const saveObservables = {
      terminos: this.legalService.createTerms(this.legalContent.terminos),
      privacidad: this.legalService.createPrivacyPolicy(this.legalContent.privacidad),
      deslinde: this.legalService.createDisclaimer(this.legalContent.deslinde)
    };

    saveObservables[type].subscribe(
      response => this.handleSaveSuccess(type),
      error => this.handleSaveError(type, error)
    );
  }

  handleSaveSuccess(type: string) {
    console.log(`${type} guardado exitosamente`);
    this.toastService.success(`${type} guardado exitosamente.`);
    this.loadDocumentByType(type);
  }

  handleSaveError(type: string, error: any) {
    console.error(`Error al guardar ${type}:`, error);
    this.toastService.error(`Hubo un error al guardar ${type}.`);
  }

  changeSelectTab(tab: string) {
    this.selectedTab = tab;
    console.log(this.selectedTab);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      this.toastService.error("Por favor selecciona un archivo.");
      return;
    }

    // Verificar la extensión del archivo
    if (!this.selectedFile.name.endsWith('.docx')) {
      this.toastService.error("Solo se permiten archivos de tipo .docx.");
      return;
    }

    console.log(this.selectedFile);
    this.legalService.uploadDocument(this.selectedFile, this.selectedTab).subscribe(
      response => {
        console.log('Document uploaded successfully:', response);
        this.toastService.success("Documento subido exitosamente.");
      },
      error => {
        console.error('Error uploading document:', error);
        this.toastService.error("Hubo un error al subir el documento.");
      }
    );
  }

  editDocument(document: any) {
    this.documentToEdit = { ...document }; // Crear una copia del documento para editar
  }

  saveEditedDocument() {
    if (this.documentToEdit) {
      this.legalService.editDocument(this.documentToEdit.tipo, this.documentToEdit.id, this.documentToEdit).subscribe(
        response => {
          this.toastService.success("Documento actualizado exitosamente.");
          this.loadLegalDocuments(); // Recargar documentos
          this.documentToEdit = null; // Limpiar selección
        },
        error => {
          console.error('Error al actualizar el documento:', error);
          this.toastService.error("Hubo un error al actualizar el documento.");
        }
      );
    }
  }

  cancelEdit() {
    this.documentToEdit = null; // Limpiar selección al cancelar la edición
  }
}

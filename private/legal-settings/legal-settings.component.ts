import { Component } from '@angular/core';
import { LegalService } from '../services/legal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-legal-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './legal-settings.component.html',
  styleUrls: ['./legal-settings.component.scss']
})
export class LegalSettingsComponent {
  selectedTab: string = 'terminos';
  legalContent = { terminos: '', privacidad: '', deslinde: '' };
  savedDocuments: any = { terminos: [], privacidad: [], deslinde: [] };
  selectedFile: File | null = null;

  constructor(private legalService: LegalService) {
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
    this.loadDocumentByType(type);
  }

  handleSaveError(type: string, error: any) {
    console.error(`Error al guardar ${type}:`, error);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument() {
    if (!this.selectedFile) {
      console.error('No hay archivo seleccionado');
      return;
    }

    this.legalService.uploadDocument(this.selectedFile, this.selectedTab).subscribe(
      response => {
        console.log('Documento subido exitosamente');
        this.loadDocumentByType(this.selectedTab);
      },
      error => console.error('Error al subir el documento', error)
    );
  }

  editDocument(document: any) {
    // Implementar funcionalidad de edición
  }
}

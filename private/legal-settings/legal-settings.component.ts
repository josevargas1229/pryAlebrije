import { Component, OnInit } from '@angular/core';
import { LegalService } from '../services/legal.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'angular-toastify';

interface LegalDocument {
  id: number;
  tipo: string;
  contenido_html: string;
  fecha_creacion: Date;
  vigente: boolean;
}

@Component({
  selector: 'app-legal-settings',
  templateUrl: './legal-settings.component.html',
  styleUrls: ['./legal-settings.component.scss']
})
export class LegalSettingsComponent implements OnInit {
  private readonly tabMap = {
    'terminos': 0,
    'privacidad': 1,
    'deslinde': 2
  };

  private readonly indexMap = ['terminos', 'privacidad', 'deslinde'];

  selectedTabIndex: number = 0;
  legalContent = { terminos: '', privacidad: '', deslinde: '' };
  savedDocuments: { [key: string]: LegalDocument[] } = {
    terminos: [],
    privacidad: [],
    deslinde: []
  };
  selectedFile: File | null = null;
  documentToEdit: LegalDocument | null = null;
  tabType:string='';
  constructor(
    private legalService: LegalService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tabType = params['tab'] || 'terminos';
      this.selectedTabIndex = this.tabMap[this.tabType] || 0;
    });
    this.loadLegalDocuments();
  }

  // Método para manejar el cambio de tabs
  onTabChange(index: number) {
    const documentType = this.indexMap[index];
    window.history.replaceState({}, '', `?tab=${documentType}`);
  }

  // Métodos de carga de documentos
  loadLegalDocuments() {
    this.indexMap.forEach(type => this.loadDocumentByType(type));
  }
  convertToDate(dateString: string): Date {
    const [day, month, yearAndTime] = dateString.split('/');
    const [year, time] = yearAndTime.split(', ');
  
    const formattedDate = `${year}-${month}-${day}T${time}`;
    return new Date(formattedDate);
  }
  private loadDocumentByType(type: string) {
    this.legalService.getAllDocumentsByType(type).subscribe({
      next: (documents: any) => {
        this.savedDocuments[type] = Array.isArray(documents) ? documents.map((doc: any) => ({
          ...doc,
          fecha_creacion: this.convertToDate(doc.fecha_creacion)
        })) : [];
      },
      error: (error) => this.handleError(type, error)
    });
  }

  private handleError(documentType: string, error: any) {
    console.error(`Error al cargar ${documentType}:`, error);
    this.toastService.error(`Hubo un error al cargar ${documentType}.`);
  }

  // Métodos para guardar documentos
  saveDocument(type: string) {
    const saveObservables = {
      terminos: this.legalService.createTerms(this.legalContent.terminos),
      privacidad: this.legalService.createPrivacyPolicy(this.legalContent.privacidad),
      deslinde: this.legalService.createDisclaimer(this.legalContent.deslinde)
    };

    saveObservables[type].subscribe({
      next: () => this.handleSaveSuccess(type),
      error: (error) => this.handleSaveError(type, error)
    });
  }

  private handleSaveSuccess(type: string) {
    this.toastService.success(`${type} guardado exitosamente.`);
    this.loadDocumentByType(type);
  }

  private handleSaveError(type: string, error: any) {
    console.error(`Error al guardar ${type}:`, error);
    this.toastService.error(`Hubo un error al guardar ${type}.`);
  }

  // Métodos para manejo de archivos
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      this.toastService.error("Por favor selecciona un archivo.");
      return;
    }

    if (!this.selectedFile.name.endsWith('.docx')) {
      this.toastService.error("Solo se permiten archivos de tipo .docx.");
      return;
    }

    const currentType = this.indexMap[this.selectedTabIndex];
    
    this.legalService.uploadDocument(this.selectedFile, currentType).subscribe({
      next: (response) => {
        this.toastService.success("Documento subido exitosamente.");
        this.loadDocumentByType(currentType);
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.toastService.error("Hubo un error al subir el documento.");
      }
    });
  }

  // Métodos para edición de documentos
  editDocument(document: LegalDocument) {
    this.documentToEdit = { ...document };
  }

  saveEditedDocument() {
    if (!this.documentToEdit) return;

    const currentType = this.indexMap[this.selectedTabIndex];
    
    this.legalService.editDocument(
      this.tabType as 'terms' | 'privacy' | 'disclaimer',
      this.documentToEdit.id,
      this.documentToEdit
    ).subscribe({
      next: () => {
        this.toastService.success("Documento actualizado exitosamente.");
        this.loadDocumentByType(currentType);
        this.documentToEdit = null;
      },
      error: (error) => {
        console.error('Error al actualizar el documento:', error);
        this.toastService.error("Hubo un error al actualizar el documento.");
      }
    });
  }

  cancelEdit() {
    this.documentToEdit = null;
  }
}
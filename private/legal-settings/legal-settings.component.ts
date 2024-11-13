import { Component, OnInit } from '@angular/core';
import { LegalService } from '../services/legal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'angular-toastify';

interface LegalDocument {
  id: number;
  tipo: string;
  nombre:string;
  contenido_html: string;
  fecha_creacion: Date;
  vigente: boolean;
  version: string;
  eliminado: boolean; 
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
    private toastService: ToastService,
    private router: Router
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
    this.router.navigate([], {
      queryParams: { tab: this.indexMap[index] },
      queryParamsHandling: 'merge'
    });
    
  }

  // Métodos de carga de documentos
  loadLegalDocuments() {
    this.indexMap.forEach(type => this.loadDocumentByType(type));
  }
  convertToDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [time, period] = timePart.split(' ');
    const [hours, minutes, seconds] = time.split(':');
  
    // Ajustar horas AM/PM a formato de 24 horas
    let hours24 = parseInt(hours, 10);
    if (period === 'PM' && hours24 < 12) {
      hours24 += 12;
    } else if (period === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
  
    // Asegurar que todos los componentes tengan dos dígitos
    const formattedMonth = parseInt(month, 10).toString().padStart(2, '0');
    const formattedDay = parseInt(day, 10).toString().padStart(2, '0');
    const formattedHours = hours24.toString().padStart(2, '0');
    const formattedMinutes = parseInt(minutes, 10).toString().padStart(2, '0');
    const formattedSeconds = parseInt(seconds, 10).toString().padStart(2, '0');
  
    // Crear la fecha en formato ISO
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  
    // Crear el objeto Date y ajustar por las 6 horas
    const date = new Date(formattedDate);
    date.setHours(date.getHours() - 6);
  
    return date;
  }
  private loadDocumentByType(type: string) {
    this.legalService.getAllDocumentsByType(type).subscribe({
      next: (documents: any) => {
        this.savedDocuments[type] = Array.isArray(documents) ? documents.map((doc: any) => ({
          ...doc,
          fecha_creacion: this.convertToDate(doc.fecha_creacion)
        })) : [];
      },
      error: (error) => this.handleApiError(type, 'cargar', error)
    });
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

  editDocument(document: LegalDocument) {
    this.documentToEdit = { ...document }; 
  }

  // Guardar el documento editado
  saveEditedDocument() {
    if (!this.documentToEdit) return;
  
    console.log('Contenido antes de enviar:', this.documentToEdit.contenido_html);  // Verifica que el contenido HTML no esté vacío
  
    const currentType = this.indexMap[this.selectedTabIndex];
    this.legalService.editDocument(
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
  

  // Método para eliminar un documento
  deleteDocument(documentId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      const currentType = this.indexMap[this.selectedTabIndex];
      this.legalService.deleteDocument(documentId).subscribe({
        next: () => {
          this.toastService.success("Documento eliminado exitosamente.");
          this.loadDocumentByType(currentType);
        },
        error: (error) => {
          console.error('Error al eliminar el documento:', error);
          this.toastService.error("Hubo un error al eliminar el documento.");
        }
      });
    }
  }

  cancelEdit() {
    this.documentToEdit = null;
  }
  handleApiError(type: string, action: string, error: any) {
    console.error(`${action} para ${type} falló:`, error);
    this.toastService.error(`Hubo un error al ${action} ${type}.`);
  }
  
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../src/environments/environment.development';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { CsrfService } from '../../src/app/services/csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class LegalService {
  private apiUrl = `${environment.API_URL}`;

  constructor(
    private http: HttpClient,
    private csrfService: CsrfService
  ) {}

  // Subir documento (nuevo método)
  uploadDocument(file: File, tipo: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post(`${this.apiUrl}/legal-documents/upload`, formData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Error uploading document:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener el documento más reciente para Términos y Condiciones
  getLatestTerms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/latest/terms`);
  }

  // Obtener el documento más reciente para Política de Privacidad
  getLatestPrivacyPolicy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/latest/privacy`);
  }

  // Obtener el documento más reciente para Deslinde Legal
  getLatestDisclaimer(): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/latest/disclaimer`);
  }

  // Obtener un documento por ID
  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/${id}`);
  }

  // Obtener documentos por tipo
  getDocumentsByType(type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/documents/${type}`);
  }

  getAllDocumentsByType(type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/legal-documents/documents/all/${type}`,{withCredentials:true});
  }
  // Crear un nuevo documento para Términos y Condiciones
  createTerms(termsData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post(`${this.apiUrl}/legal-documents/terms`, termsData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  // Crear un nuevo documento para Política de Privacidad
  createPrivacyPolicy(policyData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post(`${this.apiUrl}/legal-documents/privacy`, policyData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  // Crear un nuevo documento para Deslinde Legal
  createDisclaimer(disclaimerData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post(`${this.apiUrl}/legal-documents/disclaimer`, disclaimerData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  /// Editar un documento regulatorio (modificar versión)
editDocument(id: number, documentData: any): Observable<any> {
  return this.csrfService.getCsrfToken().pipe(
    switchMap(csrfToken => {
      return this.http.put(`${this.apiUrl}/legal-documents/documents/${id}/modify`, documentData, {
        headers: {
          'x-csrf-token': csrfToken
        },
        withCredentials: true
      });
    })
  );
}

// Eliminar un documento (marcar como eliminado)
deleteDocument(id: number): Observable<any> {
  return this.csrfService.getCsrfToken().pipe(
    switchMap(csrfToken => {
      return this.http.put(`${this.apiUrl}/legal-documents/documents/${id}/delete`, null, {
        headers: {
          'x-csrf-token': csrfToken
        },
        withCredentials: true
      });
    })
  );
}
}

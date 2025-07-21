import { Directive, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseObservable } from './base-observable';
import { environment } from '../../environments/environment';

@Directive({
    selector: '[legalDocumentBase]',
})
export abstract class LegalDocumentBase extends BaseObservable implements OnInit {
    documentContent: string = '';
    private readonly apiUrl = `${environment.API_URL}`;

    constructor(
        protected readonly http: HttpClient,
        renderer: Renderer2
    ) {
        super(renderer);
    }

    ngOnInit(): void {
        this.getDocument(this.getDocumentType());
    }

    protected getDocument(tipo: string): void {
        this.http.get<any>(`${this.apiUrl}/legal-documents/documents/${tipo}`).subscribe({
            next: (documents) => {
                this.documentContent = documents.length > 0 ? documents[0].contenido_html : '';
            },
            error: (err) => {
                console.error('Error al cargar el documento:', err);
                this.documentContent = 'No se pudo cargar el contenido. Intente de nuevo más tarde.';
            },
        });
    }

    protected abstract getDocumentType(): string;
}

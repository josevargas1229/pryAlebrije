import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-politicas-privacidad',
  templateUrl: './politicas-privacidad.component.html',
  styleUrls: ['./politicas-privacidad.component.scss']
})
export class PoliticasPrivacidadComponent implements OnInit {
  private apiUrl = `${environment.API_URL}`;
  documentContent: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getDocument('privacidad');
  }

  getDocument(tipo: string): void {
    this.http.get<any>(`${this.apiUrl}/legal-documents/documents/${tipo}`).subscribe({
      next: (documents) => {
        if (documents.length > 0) {
          this.documentContent = documents[0].contenido_html;
        }
      },
      error: (err) => console.error(err)
    });
  }
}
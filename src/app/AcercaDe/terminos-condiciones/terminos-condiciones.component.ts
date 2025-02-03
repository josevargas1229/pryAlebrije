import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.scss']
})
export class TerminosCondicionesComponent implements OnInit {
  documentContent: string = '';
  private apiUrl = `${environment.API_URL}`;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getDocument('terminos');
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

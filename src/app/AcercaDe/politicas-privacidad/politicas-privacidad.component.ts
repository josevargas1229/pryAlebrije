import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-politicas-privacidad',
  templateUrl: './politicas-privacidad.component.html',
  styleUrls: ['./politicas-privacidad.component.scss']
})
export class PoliticasPrivacidadComponent implements OnInit, AfterViewInit {
  private apiUrl = `${environment.API_URL}`;
  documentContent: string = '';
    @ViewChild('content', { static: false }) content!: ElementRef;
  constructor(private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.getDocument('privacidad');
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.content.nativeElement, 'visible');
            observer.disconnect(); // Detener la observación después de la primera vez
          }
        });
      },
      { threshold: 0.2 } // Detecta cuando el 20% del contenido es visible
    );

    observer.observe(this.content.nativeElement);
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

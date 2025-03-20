import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LegalDocumentBase } from '../legal-document-base';

@Component({
  selector: 'app-politicas-privacidad',
  templateUrl: './politicas-privacidad.component.html',
  styleUrls: ['./politicas-privacidad.component.scss'],
})
export class PoliticasPrivacidadComponent extends LegalDocumentBase {
  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(http: HttpClient, renderer: Renderer2) {
    super(http, renderer);
  }

  protected getDocumentType(): string {
    return 'privacidad';
  }

  protected getObservedElement(): ElementRef {
    return this.content;
  }
}
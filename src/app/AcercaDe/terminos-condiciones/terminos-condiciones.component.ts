import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LegalDocumentBase } from '../legal-document-base';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.scss'],
})
export class TerminosCondicionesComponent extends LegalDocumentBase {
  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(http: HttpClient, renderer: Renderer2) {
    super(http, renderer);
  }

  protected getDocumentType(): string {
    return 'terminos';
  }

  protected getObservedElement(): ElementRef {
    return this.content;
  }
}
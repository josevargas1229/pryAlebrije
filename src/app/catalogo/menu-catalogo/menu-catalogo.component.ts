import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIAS, Categoria } from './menu-catalogo-config';
import { BaseObservable } from '../../AcercaDe/base-observable';

@Component({
  selector: 'app-menu-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-catalogo.component.html',
  styleUrls: ['./menu-catalogo.component.scss'],
})
export class MenuCatalogoComponent extends BaseObservable implements OnInit {
  @ViewChild('menuContainer', { static: false }) menuContainer!: ElementRef;
  categorias: Categoria[] = CATEGORIAS;

  constructor(renderer: Renderer2) {
    super(renderer);
  }

  ngOnInit(): void {
    // Implementación básica, elimina el throw si no es necesario
  }

  protected getObservedElement(): ElementRef {
    return this.menuContainer;
  }
}
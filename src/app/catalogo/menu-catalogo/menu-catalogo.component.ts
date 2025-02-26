import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-catalogo.component.html',
  styleUrl: './menu-catalogo.component.scss'
})
export class MenuCatalogoComponent implements OnInit, AfterViewInit {
  constructor(
    private renderer: Renderer2
  ) {}
  @ViewChild('menuContainer', { static: false }) menuContainer!: ElementRef;

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.menuContainer.nativeElement, 'visible');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(this.menuContainer.nativeElement);
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  categorias = [
    { nombre: 'Niñas', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Niños', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'Rec. Nacidos', imagen: 'assets/images/ropa.jpg'},
    { nombre: '1-3X', imagen: 'assets/images/ropa.jpg' },
    { nombre: 'H-10', imagen: 'assets/images/ropa.jpg' },
    { nombre: '12-16', imagen: 'assets/images/ropa.jpg' },
  ];

  }

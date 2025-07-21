import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecomendacionService } from '../../src/app/services/recomendacion/recomendacion.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    RouterLink,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule,
    MatChipsModule
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('recomendadosContainer', { static: false }) recomendadosContainer!: ElementRef;
  @ViewChild('carouselWrapper', { static: false }) carouselWrapper!: ElementRef;
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;
@ViewChild('aboutSection', { static: false }) aboutSection!: ElementRef;
@ViewChild('productsSection', { static: false }) productsSection!: ElementRef;
@ViewChild('locationSection', { static: false }) locationSection!: ElementRef;



  productosRecomendados: any[] = [];
  carruselUrl: string = 'assets/images/logoAle.png';

  // Variables del carrusel
  currentSlide: number = 0;
  itemsPerView: number = 4;
  canScrollPrev: boolean = false;
  canScrollNext: boolean = true;
  indicators: number[] = [];

  constructor(
    private readonly renderer: Renderer2,
    private readonly recomendacionService: RecomendacionService
  ) {}

  ngOnInit(): void {
    this.recomendacionService.obtenerRelacionados(70).subscribe({
      next: (res: any) => {
        this.productosRecomendados = res;
        this.setupCarousel();
      },
      error: err => console.error('Error recomendaciones', err)
    });

    // Listener para redimensionamiento de ventana
    window.addEventListener('resize', () => this.updateItemsPerView());
  }

  ngAfterViewInit(): void {
    // Observer para animaciones
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        this.renderer.addClass(e.target, 'visible-section');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
    [this.aboutSection, this.productsSection, this.locationSection]
    .forEach(sec => revealObserver.observe(sec.nativeElement));

    if (this.recomendadosContainer) {
      observer.observe(this.recomendadosContainer.nativeElement);
    }

    // Configurar carrusel después de que se inicialicen las vistas
    setTimeout(() => {
      this.updateItemsPerView();
      this.setupCarousel();
    }, 100);
  }

  private setupCarousel(): void {
    if (this.productosRecomendados.length > 0) {
      const totalSlides = Math.ceil(this.productosRecomendados.length / this.itemsPerView);
      this.indicators = Array(totalSlides).fill(0).map((_, i) => i);
      this.updateNavigationButtons();
    }
  }

  private updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width < 576) {
      this.itemsPerView = 1;
    } else if (width < 768) {
      this.itemsPerView = 2;
    } else if (width < 992) {
      this.itemsPerView = 3;
    } else {
      this.itemsPerView = 4;
    }
  }

  scrollCarousel(direction: 'prev' | 'next'): void {
    if (!this.carouselTrack) return;

    const cardWidth = 300; // Ancho aproximado de cada tarjeta + gap
    const scrollAmount = cardWidth * this.itemsPerView;

    if (direction === 'next' && this.canScrollNext) {
      this.currentSlide++;
    } else if (direction === 'prev' && this.canScrollPrev) {
      this.currentSlide--;
    }

    const translateX = -(this.currentSlide * scrollAmount);
    this.renderer.setStyle(
      this.carouselTrack.nativeElement,
      'transform',
      `translateX(${translateX}px)`
    );

    this.updateNavigationButtons();
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
    const cardWidth = 300;
    const scrollAmount = cardWidth * this.itemsPerView;
    const translateX = -(this.currentSlide * scrollAmount);

    this.renderer.setStyle(
      this.carouselTrack.nativeElement,
      'transform',
      `translateX(${translateX}px)`
    );

    this.updateNavigationButtons();
  }

  private updateNavigationButtons(): void {
    const maxSlides = Math.ceil(this.productosRecomendados.length / this.itemsPerView) - 1;
    this.canScrollPrev = this.currentSlide > 0;
    this.canScrollNext = this.currentSlide < maxSlides;
  }

  // Auto-scroll del carrusel (opcional)
  startAutoScroll(): void {
    setInterval(() => {
      if (this.canScrollNext) {
        this.scrollCarousel('next');
      } else {
        this.currentSlide = 0;
        this.goToSlide(0);
      }
    }, 5000);
  }
}

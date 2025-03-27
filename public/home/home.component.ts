import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Product {
  title: string;
  price: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [RouterLink,CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(private readonly renderer: Renderer2) {}

  @ViewChild('homeContainer', { static: false }) homeContainer!: ElementRef;
  @ViewChild('liquiContainer', { static: false }) liquiContainer!: ElementRef;
  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 } // Se activa cuando el 20% del elemento es visible
    );

    if (this.homeContainer) {
      observer.observe(this.homeContainer.nativeElement);
    }

    if (this.liquiContainer) {
      observer.observe(this.liquiContainer.nativeElement);
    }
  }

  ngOnInit(): void {
  }

  imageUrl = 'assets/images/ropa.jpg';

  bestSellers: Product[] = [
    { title: 'Vestido Flores', price: 350 },
    { title: 'Guayabera Niño', price: 300 }
  ];

  clearanceOffers: Product[] = [
    { title: 'Conjunto Rosa', price: 200 },
    { title: 'Vestido Casual', price: 250 },
    { title: 'Vestido Patrio', price: 180 },
    { title: 'Camisa Niño', price: 220 }
  ];
}

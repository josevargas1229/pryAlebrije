import { Component } from '@angular/core';
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
export class HomeComponent {
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

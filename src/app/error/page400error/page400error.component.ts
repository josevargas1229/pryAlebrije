import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error400',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './page400error.component.html',
  styleUrls: ['./page400error.component.scss'] // Cambio de 'styleUrl' a 'styleUrls'
})
export class Page400errorComponent {
  constructor(private readonly router: Router) {}

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}


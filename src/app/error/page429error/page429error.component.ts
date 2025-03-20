import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page429error',
  standalone: true,
  imports: [MatCardModule,MatIconModule,MatListModule,MatProgressSpinnerModule],
  templateUrl: './page429error.component.html',
  styleUrl: './page429error.component.scss'
})
export class Page429errorComponent {
  constructor(private readonly router: Router) {}

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

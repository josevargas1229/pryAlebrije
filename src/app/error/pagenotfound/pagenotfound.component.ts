import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [MatListModule, MatIconModule,MatCardModule,MatButtonModule],
  templateUrl: './pagenotfound.component.html',
  styleUrl: './pagenotfound.component.scss'
})
export class PagenotfoundComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

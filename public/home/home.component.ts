import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone:true,
  templateUrl: './home.component.html',
  imports:[MatCardModule,MatButtonModule],
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

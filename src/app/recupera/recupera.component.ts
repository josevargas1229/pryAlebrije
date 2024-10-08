import { Component } from '@angular/core';

@Component({
  selector: 'app-recupera',
  standalone: true,
  templateUrl: './recupera.component.html',
  styleUrls: ['./recupera.component.css']
})
export class RecuperaComponent {
  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}

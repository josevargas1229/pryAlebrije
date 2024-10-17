import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editdeslinde',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editdeslinde.component.html',
  styleUrl: './editdeslinde.component.scss'
})
export class EditdeslindeComponent implements OnInit{
  isModalOpen = false;
  isLoading = false;
  modalTitle = 'Create New Entity';
  submitButtonText = 'Create';
  entity: any = {};

  ngOnInit() {
    this.openModal();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.entity = {};
  }

  onSubmit() {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      console.log('Entity submitted:', this.entity);
      this.isLoading = false;
      this.closeModal();
    }, 1500);
  }
}

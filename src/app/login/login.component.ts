import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone:true,
  imports:[FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.email && this.password) {
      this.isLoading = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Login submitted', { email: this.email, password: this.password, rememberMe: this.rememberMe });
        this.isLoading = false;
        // Here you would typically handle the login logic, such as calling an authentication service
      }, 2000);
    }
  }
}

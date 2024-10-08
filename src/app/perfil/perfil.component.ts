import { Component } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  userName = 'Brandon Lara';
  userEmail = 'brandon.lara@example.com';
  userFullName = 'Brandon Armando Lara Rosas';
  userAddress = '1234 Calle Falsa, Ciudad, País';
  userPhone = '+52 123 456 7890';
  userBirthday = '01/01/1990';
}

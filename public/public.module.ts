import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';  // Asegúrate de que este componente exista
import { LoginComponent } from '../src/app/login/login.component';

@NgModule({
  declarations: [
    HomeComponent,  // Declaraciones de los componentes en el módulo público
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent },  // Ruta principal de este módulo
      { path: 'login', component:LoginComponent}
    ])
  ]
})
export class PublicModule { }

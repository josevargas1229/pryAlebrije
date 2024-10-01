import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';  // Asegúrate de que este componente exista

@NgModule({
  declarations: [
    HomeComponent  // Declaraciones de los componentes en el módulo público
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent }  // Ruta principal de este módulo
    ])
  ]
})
export class PublicModule { }

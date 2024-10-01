import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';  // Asegúrate de que este componente exista

@NgModule({
  declarations: [
    DashboardComponent  // Declaraciones de los componentes en el módulo privado
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: DashboardComponent }  // Ruta principal de este módulo
    ])
  ]
})
export class PrivateModule { }

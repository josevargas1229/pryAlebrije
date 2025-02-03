import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';  // Asegúrate de que este componente exista
import { LoginComponent } from '../src/app/auth/login/login.component';
import { MatCommonModule } from '@angular/material/core';

@NgModule({
  declarations: [ // Declaraciones de los componentes en el módulo público

  ],
  imports: [
    CommonModule,
    HomeComponent,
    MatCommonModule,
    RouterModule.forChild([
      { path: '', component: HomeComponent },  // Ruta principal de este módulo
      { path: 'login', component:LoginComponent}
    ])
  ]
})
export class PublicModule { }

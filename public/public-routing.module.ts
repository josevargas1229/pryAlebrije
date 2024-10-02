import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Asegúrate de que la ruta sea correcta
import { LoginComponent } from '../src/app/login/login.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Aquí lo agregas para que se cargue al acceder a 'public'
  { path: 'login', component:LoginComponent}
  // Otras rutas públicas...
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }

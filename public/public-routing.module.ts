import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Asegúrate de que la ruta sea correcta

const routes: Routes = [
  { path: '', component: HomeComponent }, // Aquí lo agregas para que se cargue al acceder a 'public'
  // Otras rutas públicas...
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }

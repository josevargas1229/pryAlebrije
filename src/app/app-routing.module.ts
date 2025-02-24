import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './private/dashboard/dashboard.component';
import { TerminosCondicionesComponent } from './AcercaDe/terminos-condiciones/terminos-condiciones.component';
import { Breadcrumb, BreadCrumbStyle } from 'primeng/breadcrumb';

const routes: Routes = [
  // Sección pública
  { path: 'home', component: HomeComponent,},
  { path: 'login', component: LoginComponent, },
  { path: 'register', component: RegisterComponent,},

  // Sección privada (puedes protegerla con un guard más tarde)
  { path: 'dashboard', component: DashboardComponent, data: {Breadcrumb: 'dashboard'} },

  // Otras páginas
  { path: 'terminos-condiciones', component: TerminosCondicionesComponent, data: {Breadcrumb: 'terminos-condiciones'} },

  // Redirección predeterminada
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Ruta wildcard para manejar errores 404
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

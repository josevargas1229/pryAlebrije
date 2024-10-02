import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', component:HomeComponent},
  { path: 'terminos-condiciones', component: TerminosCondicionesComponent},
  { path: 'login', component:LoginComponent},
  { path: 'register', component: RegisterComponent}
];

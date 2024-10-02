import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component'; // Asegúrate de que esta ruta sea correcta
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: 'public',
    loadChildren: () => import('../../public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'private',
    loadChildren: () => import('../../private/private.module').then(m => m.PrivateModule)
  },
  {
    path: '', redirectTo: 'public', pathMatch: 'full' // Redirecciona a 'public' por defecto
  },
  {
    path: 'home', component: HomeComponent // Cambia el path a 'home'
  },
  {
    path: 'terminos-condiciones', component:TerminosCondicionesComponent
  },
  {
    path: 'login', component:LoginComponent
  },
  {
    path: 'register', component: RegisterComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

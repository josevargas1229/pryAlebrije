import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component'; // Asegúrate de que esta ruta sea correcta

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

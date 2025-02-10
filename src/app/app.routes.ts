import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './AcercaDe/terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecuperaComponent } from './auth/recupera/recupera.component';
import { PerfilComponent } from './user/perfil/perfil.component';
import { EditpolitComponent } from './editpolit/editpolit.component';
import { EditerminosComponent } from './editerminos/editerminos.component';
import { EditperfilemComponent } from './user/editperfilem/editperfilem.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { PagenotfoundComponent } from './error/pagenotfound/pagenotfound.component';
import { Page400errorComponent } from './error/page400error/page400error.component';
import { Page500errorComponent } from './error/page500error/page500error.component';
import { NoAuthGuard } from './guards/auth/no-auth.guard';
import { ConfigComponent } from './config/config.component';
import { EmailVerificacionComponent } from './auth/email-verificacion/email-verificacion.component';
import { PoliticasPrivacidadComponent } from './AcercaDe/politicas-privacidad/politicas-privacidad.component';
import { ProductosComponent } from './catalogo/productos/productos.component';

export const routes: Routes = [
  //rutas públicas
  { path: "", component: HomeComponent, data: { Breadcrumb: "Home" },  },
  { path: "terminos-condiciones", component: TerminosCondicionesComponent,data: { Breadcrumb: "Terminos-condiciones" } },
  { path: "politicas-privacidad", component: PoliticasPrivacidadComponent, data: { Breadcrumb: "Politicas-privacidad" } },
  { path: 'editpolit', component:EditpolitComponent},
  { path: 'editerminos', component:EditerminosComponent},
  { path: 'editdeslinde', component:EditperfilemComponent},
  { path: 'editperfilem', component:EditperfilemComponent},
  { path: 'editpolit', component: EditpolitComponent },
  { path: 'editerminos', component: EditerminosComponent },
  { path: 'editdeslinde', component: EditperfilemComponent },
  { path: 'editperfilem', component: EditperfilemComponent },
  { path: 'verificacion', component:EmailVerificacionComponent},
  { path: 'productos', component:ProductosComponent, data: { Breadcrumb: "Productos" } },

  //rutas para usuarios autenticados
  {
    path: '', children: [
      {
        path: 'perfil',
        children: [
          { path: '', component: PerfilComponent },
          { path: 'config', component: ConfigComponent }
        ]
      },
      { path: 'admin',loadChildren: () => import('./private/private.module').then(m => m.PrivateModule)},
    ], canActivate: [AuthGuard]
  },
  //rutas para usuarios no autenticados
  {
    path: '', children: [
      { path: "home", component: HomeComponent,},
      { path: "login", component: LoginComponent, data: { Breadcrumb: "Login" } },
      { path: "register", component: RegisterComponent, data: { Breadcrumb: "Registro" } },
      { path: 'recupera', component:RecuperaComponent, data: { Breadcrumb: "Recuperar-contraseña" } },
    ],canActivate:[NoAuthGuard]
  },
  { path: "error-400", component: Page400errorComponent },
  { path: "error-500", component: Page500errorComponent },
  //error 404
  { path: "**", component: PagenotfoundComponent }
];

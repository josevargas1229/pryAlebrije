import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecuperaComponent } from './recupera/recupera.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditpolitComponent } from './editpolit/editpolit.component';
import { EditerminosComponent } from './editerminos/editerminos.component';
import { EditperfilemComponent } from './editperfilem/editperfilem.component';
import { AuthGuard } from './guards/auth/auth.guard';


import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { NoAuthGuard } from './guards/auth/no-auth.guard';
import { ConfigComponent } from './config/config.component';
import { PrivateModule } from '../../private/private.module';
import { EmailVerificacionComponent } from './email-verificacion/email-verificacion.component';

export const routes: Routes = [
  //rutas públicas
  { path: "", component: HomeComponent },
  { path: "terminos-condiciones", component: TerminosCondicionesComponent },
  { path: 'editpolit', component:EditpolitComponent},
  { path: 'editerminos', component:EditerminosComponent},
  { path: 'editdeslinde', component:EditperfilemComponent},
  { path: 'editperfilem', component:EditperfilemComponent},
  { path: 'editpolit', component: EditpolitComponent },
  { path: 'editerminos', component: EditerminosComponent },
  { path: 'editdeslinde', component: EditperfilemComponent },
  { path: 'editperfilem', component: EditperfilemComponent },
  { path: 'verificacion', component:EmailVerificacionComponent},

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
      { path: 'admin',loadChildren: () => import('../../private/private.module').then(m => m.PrivateModule) },
    ], canActivate: [AuthGuard]
  },
  //rutas para usuarios no autenticados
  {
    path: '', children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: 'recupera', component:RecuperaComponent},
    ],canActivate:[NoAuthGuard]
  },
  //error 404
  { path: "**", component: PagenotfoundComponent }
];

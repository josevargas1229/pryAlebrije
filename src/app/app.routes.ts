import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from '../../private/dashboard/dashboard.component';
import { RecuperaComponent } from './recupera/recupera.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EditpolitComponent } from './editpolit/editpolit.component';
import { EditerminosComponent } from './editerminos/editerminos.component';
import { EditperfilemComponent } from './editperfilem/editperfilem.component';
import { AuthGuard } from './guards/auth/auth.guard';


export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "terminos-condiciones", component: TerminosCondicionesComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent,canActivate:[AuthGuard]},
  { path: 'recupera', component:RecuperaComponent},
  { path: 'perfil', component:PerfilComponent},
  { path: 'editpolit', component:EditpolitComponent},
  { path: 'editerminos', component:EditerminosComponent},
  { path: 'editdeslinde', component:EditperfilemComponent},
  { path: 'editperfilem', component:EditperfilemComponent},
  { path: 'perfil', component:PerfilComponent,canActivate:[AuthGuard]}




  // { path: "my-profile", component: UserProfileComponent },
  // { path: "contact-us", component: ContactUsComponent },
  // //admin
  // {
  //   path: '', children: [
  //     { path: "admin/login", component: AdminLoginComponent }
  //   ]
  // },
  // {
  //   path: '', children: [
  //     { path: "admin/dashboard", component: AdminDashboardComponent },
  //     { path: "admin/user", component: UserCrudComponent },
  //     { path: "admin/product", component: ProductComponent }
  //   ]
  // },
  // {
  //   path: '', children: [
  //     { path: "sing-in", component: SinginSingupComponent },
  //     { path: "sing-up", component: SinginSingupComponent },
  //   ]
  // },
  // {
  //   path: '', children: [
  //     { path: "seller/dashboard", component: SellerDashboardComponent },
  //     { path: "seller/product", component: ProductComponent },
  //   ]
  // },
  // {
  //   path: '', children: [
  //     { path: "buyer/dashboard", component: BuyerDashboardComponent },
  //     { path: "checkout", component: CheckoutComponent },
  //   ]
  // },
  // { path: "**", component: PageNotFoundComponent }
];

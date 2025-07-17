import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './AcercaDe/terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecuperaComponent } from './auth/recupera/recupera.component';
import { PerfilComponent } from './user/perfil/perfil.component';
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
import { MenuCatalogoComponent } from './catalogo/menu-catalogo/menu-catalogo.component';
import { CartComponent } from './cart/cart.component';
import { ContactoComponent } from './contacto/contacto.component';
import { ProductoDetalleComponent } from './catalogo/producto-detalle/producto-detalle.component';
import { Breadcrumb } from 'primeng/breadcrumb';
import { CheckoutComponent } from './checkout/checkout.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { SuccessPageComponent } from './success/success-page/success-page.component';
import { FailurePageComponent } from './success/failure-page/failure-page.component';
import { PendingPageComponent } from './success/pending-page/pending-page.component';
import { TransaccionesComponent } from './transacciones/transacciones.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';

export const routes: Routes = [
  //rutas públicas
  { path: "", component: HomeComponent, data: { Breadcrumb: "Home" }, },
  { path: "terminos-condiciones", component: TerminosCondicionesComponent, data: { Breadcrumb: "Terminos-condiciones" } },
  { path: "aviso-privacidad", component: PoliticasPrivacidadComponent, data: { Breadcrumb: "Aviso-privacidad" } },
  { path: 'editdeslinde', component: EditperfilemComponent },
  { path: 'editperfilem', component: EditperfilemComponent },
  { path: 'verificacion', component:EmailVerificacionComponent},
  { path: 'cart', component:CartComponent, data: { Breadcrumb: "Carrito" } },
  { path: 'contacto', component:ContactoComponent, data: { Breadcrumb: "Contacto" } },
  { path: 'checkout', component:CheckoutComponent, data: { Breadcrumb: "Checkout" } },

  { path: 'editdeslinde', component: EditperfilemComponent },
  { path: 'editperfilem', component: EditperfilemComponent },
  { path: 'verificacion', component: EmailVerificacionComponent },
  { path: 'cart', component: CartComponent, data: { Breadcrumb: "Carrito" } },
  { path: 'success', component: SuccessPageComponent, data: { Breadcrumb: "Exito" } },
  { path: 'failure', component: FailurePageComponent, data: { Breadcrumb: "Fallo" } },
  { path: 'pending', component: PendingPageComponent, data: { Breadcrumb: "Pendiente" } },
  { path: 'transacciones', component: TransaccionesComponent, data: { Breadcrumb: "Transacciones" } },
  { path: 'notificaciones', component: NotificacionesComponent, data: { Breadcrumb: "Notificaciones" } },


  //rutas para usuarios autenticados
  {
    path: '', children: [
      {
        path: 'perfil', data: { Breadcrumb: "Perfil" },
        children: [
          { path: '', component: PerfilComponent },
          { path: 'config', component: ConfigComponent, data: { Breadcrumb: "Configuracion" } },
          { path: 'pedidos', component: PedidosComponent, data: { Breadcrumb: "Pedidos" } },

        ]
      },
      { path: 'admin', loadChildren: () => import('./private/private.module').then(m => m.PrivateModule) },
    ], canActivate: [AuthGuard]
  },
  {
    path: '', children: [
      {
        path: 'menu-catalogo', data: { Breadcrumb: "Catalogo" },
        children: [
          { path: '', component: MenuCatalogoComponent },
          {
            path: 'productos', data: { Breadcrumb: "Productos" },
            children: [
              { path: '', component: ProductosComponent },
              { path: 'producto-detalle/:id', component: ProductoDetalleComponent, data: { Breadcrumb: "detalle-producto" } }
            ]
          },

        ]
      }
    ],
  },
  //rutas para usuarios no autenticados
  {
    path: '', children: [
      { path: "home", component: HomeComponent, },
      { path: "login", component: LoginComponent, data: { Breadcrumb: "Login" } },
      { path: "register", component: RegisterComponent, data: { Breadcrumb: "Registro" } },
      { path: 'recupera', component: RecuperaComponent, data: { Breadcrumb: "Recuperar-contraseña" } },

    ], canActivate: [NoAuthGuard]
  },
  { path: "error-400", component: Page400errorComponent },
  { path: "error-500", component: Page500errorComponent },
  //error 404
  { path: "**", component: PagenotfoundComponent }
];

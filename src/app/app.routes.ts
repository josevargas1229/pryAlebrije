import { Routes } from '@angular/router';
import { HomeComponent } from '../../public/home/home.component';
import { TerminosCondicionesComponent } from './AcercaDe/terminos-condiciones/terminos-condiciones.component';
import { PoliticasPrivacidadComponent } from './AcercaDe/politicas-privacidad/politicas-privacidad.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecuperaComponent } from './auth/recupera/recupera.component';
import { EmailVerificacionComponent } from './auth/email-verificacion/email-verificacion.component';

import { PerfilComponent } from './user/perfil/perfil.component';
import { EditperfilemComponent } from './user/editperfilem/editperfilem.component';
import { ConfigComponent } from './config/config.component';
import { PedidosComponent } from './pedidos/pedidos.component';

import { MenuCatalogoComponent } from './catalogo/menu-catalogo/menu-catalogo.component';
import { ProductosComponent } from './catalogo/productos/productos.component';
import { ProductoDetalleComponent } from './catalogo/producto-detalle/producto-detalle.component';

import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { TransaccionesComponent } from './transacciones/transacciones.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';

import { SuccessPageComponent } from './success/success-page/success-page.component';
import { FailurePageComponent } from './success/failure-page/failure-page.component';
import { PendingPageComponent } from './success/pending-page/pending-page.component';

import { AsistenciaEmpleadoComponent } from './asistencia-empleado/asistencia-empleado.component';

import { AuthGuard } from './guards/auth/auth.guard';
import { NoAuthGuard } from './guards/auth/no-auth.guard';

import { PagenotfoundComponent } from './error/pagenotfound/pagenotfound.component';
import { Page400errorComponent } from './error/page400error/page400error.component';
import { Page500errorComponent } from './error/page500error/page500error.component';

export const routes: Routes = [
  // Públicas
  { path: '', component: HomeComponent, pathMatch: 'full', data: { Breadcrumb: 'Home' } },
  { path: 'home', component: HomeComponent },
  { path: 'terminos-condiciones', component: TerminosCondicionesComponent, data: { Breadcrumb: 'Terminos-condiciones' } },
  { path: 'aviso-privacidad', component: PoliticasPrivacidadComponent, data: { Breadcrumb: 'Aviso-privacidad' } },
  { path: 'verificacion', component: EmailVerificacionComponent },
  { path: 'cart', component: CartComponent, data: { Breadcrumb: 'Carrito' } },
  { path: 'checkout', component: CheckoutComponent, data: { Breadcrumb: 'Checkout' } },
  { path: 'success', component: SuccessPageComponent, data: { Breadcrumb: 'Exito' } },
  { path: 'failure', component: FailurePageComponent, data: { Breadcrumb: 'Fallo' } },
  { path: 'pending', component: PendingPageComponent, data: { Breadcrumb: 'Pendiente' } },
  { path: 'transacciones', component: TransaccionesComponent, data: { Breadcrumb: 'Transacciones' } },
  { path: 'notificaciones', component: NotificacionesComponent, data: { Breadcrumb: 'Notificaciones' } },

  // Catálogo (público)
  {
    path: 'menu-catalogo',
    data: { Breadcrumb: 'Catalogo' },
    children: [
      { path: '', component: MenuCatalogoComponent },
      {
        path: 'productos',
        data: { Breadcrumb: 'Productos' },
        children: [
          { path: '', component: ProductosComponent },
          { path: 'producto-detalle/:id', component: ProductoDetalleComponent, data: { Breadcrumb: 'detalle-producto' } },
        ],
      },
    ],
  },

  // Autenticados
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'perfil',
        data: { Breadcrumb: 'Perfil' },
        children: [
          { path: '', component: PerfilComponent },
          { path: 'config', component: ConfigComponent, data: { Breadcrumb: 'Configuracion' } },
          { path: 'pedidos', component: PedidosComponent, data: { Breadcrumb: 'Pedidos' } },
          { path: 'editdeslinde', component: EditperfilemComponent },
          { path: 'editperfilem', component: EditperfilemComponent },
        ],
      },
      { path: 'admin', loadChildren: () => import('./private/private.module').then(m => m.PrivateModule) },
      { path: 'asistencia-empleado', component: AsistenciaEmpleadoComponent, data: { Breadcrumb: 'Asistencia-empleado' } },
    ],
  },

  // No autenticados
  {
    path: '',
    canActivate: [NoAuthGuard],
    children: [
      { path: 'login', component: LoginComponent, data: { Breadcrumb: 'Login' } },
      { path: 'register', component: RegisterComponent, data: { Breadcrumb: 'Registro' } },
      { path: 'recupera', component: RecuperaComponent, data: { Breadcrumb: 'Recuperar-contraseña' } },
    ],
  },

  // Errores
  { path: 'error-400', component: Page400errorComponent },
  { path: 'error-500', component: Page500errorComponent },
  { path: '**', component: PagenotfoundComponent },
];

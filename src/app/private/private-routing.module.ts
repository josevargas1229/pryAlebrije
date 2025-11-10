import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { LegalSettingsComponent } from './legal-settings/legal-settings.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { EmailManagementComponent } from './email-management/email-management.component';
import { ConfiguracionSistemaComponent } from './configuracion-sistema/configuracion-sistema.component';
import { BloqueosComponent } from './bloqueos/bloqueos.component';
import { LogsComponent } from './logs/logs.component';
import { ClientGrowComponent } from './client-grow/client-grow.component';
import { ReportesGamificacionComponent } from './reportes-gamificacion/reportes-gamificacion.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: HomeDashboardComponent, data: { Breadcrumb: "Panel-administracion" } },
      { path: 'legal', component: LegalSettingsComponent, data: { Breadcrumb: "Legal" } },
      { path: 'sistema', component: ConfiguracionSistemaComponent, data: { Breadcrumb: "Sistema" } },
      { path: 'empresa', component: CompanySettingsComponent, data: { Breadcrumb: "Empresa" } },
      { path: 'correos', component: EmailManagementComponent, data: { Breadcrumb: "Correos" } },
      { path: 'bloqueos', component: BloqueosComponent, data: { Breadcrumb: "Bloqueos" } },
      { path: 'incidencias', component: LogsComponent, data: { Breadcrumb: "Incidencias" } },
      {
        path: 'empleados',
        loadChildren: () => import('./empleados/empleados.module').then(m => m.EmpleadosModule),
        data: { Breadcrumb: "Panel-empleados" }
      },
      {
        path: 'ruletas',
        loadChildren: () => import('./ruletas/ruletas.module').then(m => m.RuletasModule),
        data: { Breadcrumb: "Ruletas" }
      },
     {
  path: 'premios',
  loadChildren: () => import('./premios/premios.module').then(m => m.PremiosModule),
  data: { Breadcrumb: "Premios" }
},
{
        path: 'gamificacion-reportes',
        component: ReportesGamificacionComponent,
        data: { Breadcrumb: 'Reportes gamificación' }
      },
    ]
  },
  { path: 'calculadora', component: ClientGrowComponent, data: { Breadcrumb: "Calculadora" } },
  { path: 'productos', loadChildren: () => import('./productos/productos.module').then(m => m.ProductosModule), data: { Breadcrumb: "Panel-productos" } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule { }

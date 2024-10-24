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

const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: HomeDashboardComponent },
      { path: 'legal', component: LegalSettingsComponent },
      { path: 'sistema', component: ConfiguracionSistemaComponent },
      { path: 'empresa', component: CompanySettingsComponent },
      { path: 'correos', component: EmailManagementComponent },
      { path: 'bloqueos', component: BloqueosComponent },
      { path: 'incidencias', component: LogsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { PrivateRoutingModule } from './private-routing.module';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import { EmailManagementComponent } from './email-management/email-management.component';
import { EmailTemplatesComponent } from './email-templates/email-templates.component';
import { EmailTypesComponent } from './email-types/email-types.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { EmailTypeDialogComponent } from './email-type-dialog/email-type-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { EmailTemplateDialogComponent } from './email-template-dialog/email-template-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ConfiguracionSistemaComponent } from './configuracion-sistema/configuracion-sistema.component';
import { MatSpinner } from '@angular/material/progress-spinner';
import { A11yModule } from '@angular/cdk/a11y';
import { BloqueosComponent } from './bloqueos/bloqueos.component';
import { LogsComponent } from './logs/logs.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { LegalSettingsComponent } from './legal-settings/legal-settings.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { ProductosModule } from './productos/productos.module';
import { DashboardPanelComponent } from '../components/dashboard-panel-component/dashboard-panel-component.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { ClientGrowComponent } from './client-grow/client-grow.component';
import { EmpleadosModule } from './empleados/empleados.module';
import { RuletasModule } from './ruletas/ruletas.module';
@NgModule({
  declarations: [
    DashboardComponent,
    HomeDashboardComponent,
    EmailManagementComponent,
    EmailTemplatesComponent,
    EmailTemplateDialogComponent,
    EmailTypesComponent,
    EmailTypeDialogComponent,
    ConfiguracionSistemaComponent,
    BloqueosComponent,
    LogsComponent,
    CompanySettingsComponent,
    LegalSettingsComponent,
    AuditLogsComponent,
    ClientGrowComponent
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconButton,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSidenavContainer,
    RouterModule,
    PrivateRoutingModule,
    MatCardModule,
    MatIconModule,
    RouterLinkActive,
    MatToolbarModule,
    MatTableModule,
    MatIcon,
    MatTabsModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTooltipModule,
    AngularToastifyModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSpinner,
    A11yModule,
    MatExpansionModule,
    MatChipsModule,
    MatChipListbox,
    DashboardPanelComponent,
    ProductosModule,
    EmpleadosModule,
    RuletasModule
  ],
  exports:[
    DashboardComponent,
    HomeDashboardComponent,
    EmailManagementComponent,
    BloqueosComponent,
    LogsComponent,
    LegalSettingsComponent,
    CompanySettingsComponent,
    DashboardPanelComponent,
    ProductosModule,
    AngularToastifyModule,
    AuditLogsComponent,
    EmpleadosModule,
  ],
  providers:[ToastService]
})
export class PrivateModule { }

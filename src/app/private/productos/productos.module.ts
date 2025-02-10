import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductosRoutingModule } from './productos-routing.module';
import { ProductosComponent } from './productos.component';
import { PreviewComponent } from './preview/preview.component';
import { EditComponent } from './edit/edit.component';
import { AddComponent } from './add/add.component';
import { ListComponent } from './list/list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardPanelComponent } from '../../components/dashboard-panel-component/dashboard-panel-component.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule } from '@angular/material/core';


@NgModule({
  declarations: [
    ProductosComponent,
    DashboardComponent,
    ListComponent,
    AddComponent,
    EditComponent,
    PreviewComponent,
    // HistoryComponent,    // Nuevo componente para historial
    // EliminatedComponent, // Nuevo componente para productos eliminados
    // LowStockComponent    // Nuevo componente para productos con bajo stock
  ],
  imports: [
    CommonModule,
    ProductosRoutingModule,
    DashboardPanelComponent,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatLabel,
    MatTableModule,
    MatOptionModule
  ]
})
export class ProductosModule { }

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductformComponent } from './components/productform/productform.component';
import { DetallesFormComponent } from './components/detalles-form/detalles-form.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { VarianteFormComponent } from './components/variante-form/variante-form.component';

@NgModule({
  declarations: [
    ProductosComponent,
    DashboardComponent,
    ListComponent,
    AddComponent,
    EditComponent,
    PreviewComponent,
    ProductformComponent,
    DetallesFormComponent,
    VarianteFormComponent
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
    MatTableModule,
    MatOptionModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    DialogComponent
  ]
})
export class ProductosModule { }

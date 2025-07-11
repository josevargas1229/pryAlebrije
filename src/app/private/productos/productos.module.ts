import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductosRoutingModule } from './productos-routing.module';
import { ProductosComponent } from './productos.component';
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
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
import { DeletedProductsComponent } from './deleted-products/deleted-products.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogComponent } from './components/catalog/catalog.component';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { LowStockComponent } from './low-stock/low-stock.component';
import { PromocionesComponent } from './promociones/promociones.component';
import { MatListItem } from '@angular/material/list';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
@NgModule({
  declarations: [
    ProductosComponent,
    DashboardComponent,
    ListComponent,
    AddComponent,
    EditComponent,
    ProductformComponent,
    DetallesFormComponent,
    VarianteFormComponent,
    DeletedProductsComponent,
    CatalogComponent,
    LowStockComponent,
    PromocionesComponent
    // HistoryComponent,    // Nuevo componente para historial
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
    DialogComponent,
    LoadingButtonComponent,
    MatPaginatorModule,
    MatTooltipModule,
    MatSpinner,
    MatExpansionModule,
    MatListItem,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule

  ]
})
export class ProductosModule { }

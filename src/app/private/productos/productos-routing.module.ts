import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { PreviewComponent } from './preview/preview.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeletedProductsComponent } from './deleted-products/deleted-products.component';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'list', component: ListComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Lista-productos" } },
  { path: 'add', component: AddComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Crear-producto" } },
  { path: 'eliminated', component: DeletedProductsComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Productos Eliminados" } },
  { path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Editar-producto" } },
  { path: 'preview/:id', component: PreviewComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Detalle-producto" } },
  // { path: 'history', component: HistoryComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Historial de Movimientos" } },
  // { path: 'low-stock', component: LowStockComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Productos con Bajo Stock" } }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductosRoutingModule { }

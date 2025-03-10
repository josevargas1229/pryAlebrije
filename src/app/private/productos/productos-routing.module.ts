import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeletedProductsComponent } from './deleted-products/deleted-products.component';
import { ProductoDetalleComponent } from '../../catalogo/producto-detalle/producto-detalle.component';
import { CatalogComponent } from './components/catalog/catalog.component';
import { AuditLogsComponent } from '../components/audit-logs/audit-logs.component';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'list', component: ListComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Lista-productos" } },
  { path: 'add', component: AddComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Crear-producto" } },
  { path: 'eliminated', component: DeletedProductsComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Productos Eliminados" } },
  { path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Editar-producto" } },
  { path: 'preview/:id', component: ProductoDetalleComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Detalle-producto" } },
  { path: 'categorias', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Categorías", catalogType: "categoria" } },
  { path: 'tipos', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Tipos", catalogType: "tipo" } },
  { path: 'marcas', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Marcas", catalogType: "marca" } },
  { path: 'tallas', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Tallas", catalogType: "talla" } },
  { path: 'temporadas', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Temporadas", catalogType: "temporada" } },
  { path: 'colores', component: CatalogComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Colores", catalogType: "color" } },
  { path: 'history', component: AuditLogsComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Historial de movimientos", modulo:"productos" } },
  // { path: 'low-stock', component: LowStockComponent, canActivate: [AuthGuard], data: { Breadcrumb: "Productos con Bajo Stock" } }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductosRoutingModule { }

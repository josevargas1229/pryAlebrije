import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaAsistenciaComponent } from './lista-asistencia/lista-asistencia.component';
import { GenerarQrComponent } from './generar-qr/generar-qr.component';

const routes: Routes = [
  { path: '', redirectTo: 'generar-qr', pathMatch: 'full' },
  { path: 'lista-asistencia', component: ListaAsistenciaComponent },
  { path: 'generar-qr', component: GenerarQrComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpleadosRoutingModule { }
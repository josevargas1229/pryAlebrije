import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { ListaAsistenciaComponent } from './lista-asistencia/lista-asistencia.component';
import { GenerarQrComponent } from './generar-qr/generar-qr.component';

@NgModule({
  declarations: [
    ListaAsistenciaComponent,
    GenerarQrComponent
  ],
  imports: [
    CommonModule,
    EmpleadosRoutingModule
  ]
})
export class EmpleadosModule { }
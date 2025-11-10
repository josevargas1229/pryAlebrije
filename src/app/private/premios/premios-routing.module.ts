import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PremiosComponent } from './premios/premios.component';
import { PremiosFormComponent } from './premios-form/premios-form.component'; // <-- OJO

const routes: Routes = [
  { path: '', component: PremiosComponent },
  { path: 'nuevo', component: PremiosFormComponent }, // <-- OJO
  { path: ':id', component: PremiosFormComponent },   // <-- OJO
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PremiosRoutingModule {}

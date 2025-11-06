import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RuletasComponent } from './ruletas/ruletas.component';

const routes: Routes = [
    { path: '', component: RuletasComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RuletasRoutingModule { }
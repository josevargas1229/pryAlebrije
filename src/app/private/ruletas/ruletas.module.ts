import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuletasRoutingModule } from './ruletas-routing.module';
import { RuletaFormComponent } from './ruleta-form/ruleta-form.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AngularToastifyModule } from 'angular-toastify';
import { RuletasComponent } from './ruletas/ruletas.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    RuletasComponent,
    RuletaFormComponent
  ],
  imports: [
    CommonModule,
    RuletasRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    AngularToastifyModule,
    MatCheckboxModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule
  ]
})
export class RuletasModule { }
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {MatCommonModule} from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { ThemeSwitcherComponent } from './theme-switcher/theme-switcher.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    TerminosCondicionesComponent,
    RegisterComponent,
    AppRoutingModule,
    LoginComponent,
    MatCommonModule,
    AngularToastifyModule,
    ThemeSwitcherComponent,
    ReactiveFormsModule,
    HttpClientModule


  ],
  providers: [{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},ToastService],
  bootstrap: [AppModule]
})
export class AppModule { }

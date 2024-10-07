import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

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
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppModule]
})
export class AppModule { }

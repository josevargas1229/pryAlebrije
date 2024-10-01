import { NgModule } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";


@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, // Asegúrate de que FormsModule esté aquí
    CommonModule,
    HeaderComponent,
    FooterComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }

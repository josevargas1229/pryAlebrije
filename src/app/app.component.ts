import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { AuthService } from './services/auth/auth.service';
import { ScrollToTopComponent } from "./scroll-to-top/scroll-to-top.component";
import { CompanyService } from '../../private/services/company.service.ts.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AngularToastifyModule, ScrollToTopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'pryAlebrije';
  constructor(private authService: AuthService, private toastService: ToastService, private router:Router, private companyService:CompanyService,private titleService: Title) { }
  ngOnInit() {
    this.companyService.companyProfile$.subscribe(profile => {
      if (profile && profile.nombre) {
        this.titleService.setTitle(profile.nombre);
      }
    });
    this.authService.checkAuthStatus()
      .then((response) => {
        
        if(response&&response.isValid&&response.isValid===false){
          this.toastService.info('Por favor, verifique su cuenta.');
          this.router.navigate(['/verificacion']);
        }else{
          if(response && response.tipo){
            this.authService.setUserRole(response.tipo);
          }
        }
      })
      .catch(error => {
        if (error.message !== 'No autenticado') {
          this.toastService.error('Error de autenticación: ' + error.message);
        }
      });
  }
}
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { AuthService } from './services/auth/auth.service';
import { ScrollToTopComponent } from "./scroll-to-top/scroll-to-top.component";
import { CompanyService } from '../../private/services/company.service.ts.service';
import { Title } from '@angular/platform-browser';
import { BreadcrumbModule } from 'primeng/breadcrumb'; // Importación de PrimeNG
import { filter, map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    AngularToastifyModule,
    ScrollToTopComponent,
    SidebarComponent,
    BreadcrumbModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'pryAlebrije';
  BreadcrumbItems: any[] = [];

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private companyService: CompanyService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Actualiza el título de la página con el nombre de la empresa
    this.companyService.companyProfile$.subscribe(profile => {
      if (profile && profile.nombre) {
        this.titleService.setTitle(profile.nombre);
      }
    });

    // Verifica el estado de autenticación del usuario
    this.authService.checkAuthStatus()
      .then((response) => {
        if (response && response.isValid === false) {
          this.toastService.info('Por favor, verifique su cuenta.');
          this.router.navigate(['/verificacion']);
        } else {
          if (response && response.tipo) {
            this.authService.setUserRole(response.tipo);
          }
        }
      })
      .catch(error => {
        if (error.message !== 'No autenticado') {
          this.toastService.error('Error de autenticación: ' + error.message);
        }
      });

    // Actualiza las migas de pan al cambiar de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumb(this.activatedRoute.root))
    ).subscribe(items => {
      // Agregar la ruta raíz (Home) al inicio de las migas de pan
      this.BreadcrumbItems = [{ label: 'Home', route: '/home', icon: 'pi pi-home' }, ...items];
    });
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '', Breadcrumbs: any[] = []): any[] {
    const label = route.routeConfig?.data?.['Breadcrumb']; // Usa 'Breadcrumb' como dato
    const path = route.routeConfig?.path;
    const icon = route.routeConfig?.data?.['icon']; // Recuperamos el icono desde el data

    if (path && label) {
      const routeUrl = `${url}/${path}`; // Concatenamos las rutas correctamente
      Breadcrumbs.push({ label, route: routeUrl, icon: icon || 'pi pi-folder' }); // Si no hay icono, usamos uno por defecto
    }

    // Llamada recursiva si hay una ruta hija
    if (route.firstChild) {
      return this.buildBreadcrumb(route.firstChild, url + (path ? `/${path}` : ''), Breadcrumbs);
    }

    return Breadcrumbs;
  }
}

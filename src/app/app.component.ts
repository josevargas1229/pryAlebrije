import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { AuthService } from './services/auth/auth.service';
import { ScrollToTopComponent } from './scroll-to-top/scroll-to-top.component';
import { CompanyService } from './private/services/company.service.ts.service';
import { Title } from '@angular/platform-browser';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RuletaFabComponent } from './ruleta-fab/ruleta-fab.component';
import { SwUpdatesService } from './sw-updates.service';
import { ApplicationRef } from '@angular/core';
import { firstValueFrom} from 'rxjs';

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
    RouterModule, // Agregado para soportar routerLink
    CommonModule,
    MatSidenavModule,
    RuletaFabComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'pryAlebrije';
  loadingApp= true;
  BreadcrumbItems: any[] = [];
  isSidebarCollapsed: boolean = false;
  constructor(
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly companyService: CompanyService,
    private readonly titleService: Title,
    private readonly activatedRoute: ActivatedRoute,
    private swUpdates: SwUpdatesService,
    private appRef: ApplicationRef
  ) {}



  async ngOnInit() {

     await firstValueFrom(this.appRef.isStable.pipe(filter(v => v === true)));
    this.loadingApp = false;

    this.companyService.companyProfile$.subscribe(profile => {
      const companyName = profile?.nombre;
      if (companyName) {
        this.titleService.setTitle(companyName);
      }
    });

    this.swUpdates.init();

    this.authService.checkAuthStatus()
      .then(response => {
        if (response?.isValid === false) {
          this.toastService.info('Por favor, verifique su cuenta.');
          this.router.navigate(['/verificacion']);
          return;
        }
        const userRole = response?.tipo;
        if (userRole) {
          this.authService.setUserRole(userRole);
        }
      })
      .catch(error => {
        if (error.message !== 'No autenticado') {
          console.error('Error de autenticación: ' + error.message);
        }
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.buildBreadcrumb(this.activatedRoute.root))
    ).subscribe(items => {
      this.BreadcrumbItems = [{ label: 'Home', route: '/home', icon: 'pi pi-home' }, ...items];
    });

  }
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '', Breadcrumbs: any[] = []): any[] {
    const label = route.routeConfig?.data?.['Breadcrumb'];
    const path = route.routeConfig?.path;
    const icon = route.routeConfig?.data?.['icon'];

    if (path && label) {
      const routeUrl = `${url}/${path}`;
      Breadcrumbs.push({ label, route: routeUrl, icon: icon || 'pi pi-folder' });
    }

    if (route.firstChild) {
      return this.buildBreadcrumb(route.firstChild, url + (path ? `/${path}` : ''), Breadcrumbs);
    }

    return Breadcrumbs;
  }
}

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent {
  isMobile = false;

  // Referencia al sidenav
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router,
    private readonly toastService:ToastService
  ) {}

  ngOnInit(): void {
    // Detecta si es móvil
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Cierra el sidenav en dispositivos móviles cuando cambia la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile && this.sidenav) {
          this.sidenav.close();
        }
      });
  }
}

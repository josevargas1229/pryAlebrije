import { CartService } from './../../services/cart/cart.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeSwitcherComponent } from "../../theme-switcher/theme-switcher.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanyService } from '../../private/services/company.service.ts.service';
import { SearchService } from '../../services/search.service';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { NotificacionService, Notificacion } from '../../services/notificacion/notificacion.service';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatButtonModule, MatIconModule, ThemeSwitcherComponent,
    MatToolbarModule, MatTooltipModule, FormsModule, MatMenuModule, AsyncPipe, NgIf, NgFor, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  cartCount: number = 0;
  isLoggedIn: boolean = false;
  userRole: number | null = null;
  logoUrl: string | undefined;
  isSearchModalOpen: boolean = false; // Controla si el modal de búsqueda está abierto
  searchText: string = ''; // Almacena el texto de búsqueda
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidas: number = 0;
  logorl = 'assets/images/manifest-icon-192.maskable.png';


  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router,
    private searchService: SearchService,
    private cartService: CartService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.companyService.companyProfile$.subscribe((data: any) => {
      this.logoUrl = data?.logo;
    });
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      if (this.isLoggedIn) {
        this.authService.getUserRole().subscribe((role: number | null) => {
          if(role !== null){
            this.userRole = role;
            this.notificacionService.getNotificaciones().subscribe(nots => {
            console.log('🔔 Notificaciones recibidas:', nots);
            this.notificaciones = nots;
            this.notificacionesNoLeidas = nots.filter(n => !n.leida).length;
            setTimeout(() => {
            this.notificacionesNoLeidas = 0;
            }, 180000); // 180000 ms = 3 minutos
          });
          }
        });
      }
    });

    // Resetear el filtro cuando se navega a otra sección
    this.router.events.subscribe(() => {
      this.resetSearch();
    });

    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);
    });


  }
  toggleSidebar(): void {
    this.sidebarToggle.emit(); // Emite el evento para toggle del sidebar
  }
  // Muestra el modal de búsqueda
  onSearchClick() {
    this.isSearchModalOpen = true;
  }

  // Cierra el modal de búsqueda
  closeSearchModal() {
    this.isSearchModalOpen = false;
  }




  // Aplica el filtro de búsqueda
  applySearch() {
    this.searchService.setSearchText(this.searchText); // Se actualiza el texto de búsqueda en el servicio
    this.closeSearchModal(); // Cierra el modal de búsqueda
    // Aquí puedes realizar una navegación o realizar cualquier otra acción si es necesario
  }

  // Detecta cuando el texto de búsqueda cambia
  onSearchChange() {
    this.searchService.setSearchText(this.searchText); // Se actualiza el texto de búsqueda en el servicio
  }

  // Resetea el filtro
  resetSearch() {
    this.searchText = '';
    this.searchService.setSearchText(this.searchText); // Limpiamos el servicio
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.userRole = null;
      this.router.navigate(['/']);
    });
  }
}

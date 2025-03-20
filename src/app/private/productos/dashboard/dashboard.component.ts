import { Component } from '@angular/core';
import { PRODUCTS_CONFIG_OPTIONS, ProductConfigOption } from './products-config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  productsConfigOptions: ProductConfigOption[] = PRODUCTS_CONFIG_OPTIONS;
}
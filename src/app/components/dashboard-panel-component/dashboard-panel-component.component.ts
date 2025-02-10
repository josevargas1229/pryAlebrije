import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
interface ConfigOption {
  icon: string;
  title: string;
  description: string;
  route: string;
  queryParams?: any;
}
@Component({
  selector: 'app-dashboard-panel-component',
  standalone: true,
  imports: [MatCardModule,MatIconModule,RouterLink,CommonModule],
  templateUrl: './dashboard-panel-component.component.html',
  styleUrl: './dashboard-panel-component.component.scss'
})
export class DashboardPanelComponent {
  @Input() configOptions: ConfigOption[] = [];
}

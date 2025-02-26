import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './dashboard-panel-component.component.html',
  styleUrl: './dashboard-panel-component.component.scss',
  animations: [
    trigger('viewAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('600ms ease-in-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class DashboardPanelComponent {
  @Input() configOptions: ConfigOption[] = [];
  isGridView: boolean = true;

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  getViewState(): string {
    return this.isGridView ? 'grid' : 'list';
  }
}
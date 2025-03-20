import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../private/services/company.service.ts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss'
})
export class ContactoComponent {
  companyInfo: any = {}; // Cambia el tipo según lo que devuelva tu API

    constructor(private readonly companyService: CompanyService) { }

    ngOnInit(): void {
      this.companyService.companyProfile$.subscribe((data: any) => {
        this.companyInfo = data;
      });
    }

    
}

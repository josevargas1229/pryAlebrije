import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CompanyService } from '../../../../private/services/company.service.ts.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  companyInfo: any = {}; // Cambia el tipo según lo que devuelva tu API

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.getCompanyInfo();
  }

  getCompanyInfo(): void {
    this.companyService.getCompanyProfile().subscribe((data: any) => {
      this.companyInfo = data;
    });
  }
}

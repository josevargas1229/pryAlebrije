import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesGamificacionComponent } from './reportes-gamificacion.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ReportesGamificacionService } from './reportes-gamificacion.service';

describe('ReportesGamificacionComponent', () => {
  let component: ReportesGamificacionComponent;
  let fixture: ComponentFixture<ReportesGamificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportesGamificacionComponent],
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [ReportesGamificacionService],
      schemas: [NO_ERRORS_SCHEMA], 
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesGamificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

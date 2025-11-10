import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesGamificacionComponent } from './reportes-gamificacion.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

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
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCardModule,
      ],
      providers: [
        ReportesGamificacionService, // solo por si NO es providedIn: 'root'
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesGamificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

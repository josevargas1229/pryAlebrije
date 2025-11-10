import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesGamificacionComponent } from './reportes-gamificacion.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';

describe('ReportesGamificacionComponent', () => {
  let component: ReportesGamificacionComponent;
  let fixture: ComponentFixture<ReportesGamificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportesGamificacionComponent],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatSelectModule,
        MatTableModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgChartsModule, // si tu template usa <canvas baseChart>
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesGamificacionComponent } from './reportes-gamificacion.component';

describe('ReportesGamificacionComponent', () => {
  let component: ReportesGamificacionComponent;
  let fixture: ComponentFixture<ReportesGamificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesGamificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesGamificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ReportesGamificacionService } from './reportes-gamificacion.service';

describe('ReportesGamificacionService', () => {
  let service: ReportesGamificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportesGamificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

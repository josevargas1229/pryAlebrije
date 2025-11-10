import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReportesGamificacionService } from './reportes-gamificacion.service';

describe('ReportesGamificacionService', () => {
  let service: ReportesGamificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],        
      providers: [ReportesGamificacionService],
    });
    service = TestBed.inject(ReportesGamificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { RecomendacionService } from './recomendacion.service';

describe('RecomendacionService', () => {
  let service: RecomendacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecomendacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

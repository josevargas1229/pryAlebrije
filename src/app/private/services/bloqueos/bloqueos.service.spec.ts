import { TestBed } from '@angular/core/testing';

import { BloqueosService } from './bloqueos.service';

describe('BloqueosService', () => {
  let service: BloqueosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloqueosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

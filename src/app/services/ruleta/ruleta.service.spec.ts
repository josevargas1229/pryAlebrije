import { TestBed } from '@angular/core/testing';

import { RuletaService } from './ruleta.service';

describe('RuletaService', () => {
  let service: RuletaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuletaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

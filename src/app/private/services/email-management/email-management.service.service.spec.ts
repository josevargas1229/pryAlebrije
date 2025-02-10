import { TestBed } from '@angular/core/testing';

import { EmailManagementServiceService } from './email-management.service.service';

describe('EmailManagementServiceService', () => {
  let service: EmailManagementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailManagementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

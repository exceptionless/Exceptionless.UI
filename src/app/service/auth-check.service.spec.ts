import { TestBed, inject } from '@angular/core/testing';

import { AuthCheckService } from './auth-check.service';

describe('AuthCheckService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthCheckService]
    });
  });

  it('should be created', inject([AuthCheckService], (service: AuthCheckService) => {
    expect(service).toBeTruthy();
  }));
});

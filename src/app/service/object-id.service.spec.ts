import { TestBed, inject } from '@angular/core/testing';

import { ObjectIdService } from './object-id.service';

describe('ObjectIdService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectIdService]
    });
  });

  it('should be created', inject([ObjectIdService], (service: ObjectIdService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed, inject } from '@angular/core/testing';

import { BasicService } from './basic.service';

describe('BasicService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BasicService]
    });
  });

  it('should be created', inject([BasicService], (service: BasicService) => {
    expect(service).toBeTruthy();
  }));
});

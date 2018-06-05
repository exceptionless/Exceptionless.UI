import { TestBed, inject } from '@angular/core/testing';

import { FilterStoreService } from './filter-store.service';

describe('FilterStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterStoreService]
    });
  });

  it('should be created', inject([FilterStoreService], (service: FilterStoreService) => {
    expect(service).toBeTruthy();
  }));
});

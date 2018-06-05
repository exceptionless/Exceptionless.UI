import { TestBed, inject } from '@angular/core/testing';

import { DateRangeParserService } from './date-range-parser.service';

describe('DateRangeParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateRangeParserService]
    });
  });

  it('should be created', inject([DateRangeParserService], (service: DateRangeParserService) => {
    expect(service).toBeTruthy();
  }));
});

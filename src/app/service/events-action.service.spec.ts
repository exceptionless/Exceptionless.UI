import { TestBed, inject } from '@angular/core/testing';

import { EventsActionService } from './events-action.service';

describe('EventsActionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventsActionService]
    });
  });

  it('should be created', inject([EventsActionService], (service: EventsActionService) => {
    expect(service).toBeTruthy();
  }));
});

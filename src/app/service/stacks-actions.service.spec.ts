import { TestBed, inject } from '@angular/core/testing';

import { StacksActionsService } from './stacks-actions.service';

describe('StacksActionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StacksActionsService]
    });
  });

  it('should be created', inject([StacksActionsService], (service: StacksActionsService) => {
    expect(service).toBeTruthy();
  }));
});

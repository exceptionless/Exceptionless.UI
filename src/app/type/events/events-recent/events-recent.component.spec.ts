import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsRecentComponent } from './events-recent.component';

describe('EventsRecentComponent', () => {
  let component: EventsRecentComponent;
  let fixture: ComponentFixture<EventsRecentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsRecentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

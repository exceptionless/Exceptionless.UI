import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsFrequentComponent } from './events-frequent.component';

describe('EventsFrequentComponent', () => {
  let component: EventsFrequentComponent;
  let fixture: ComponentFixture<EventsFrequentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsFrequentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

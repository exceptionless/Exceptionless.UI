import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsNewComponent } from './events-new.component';

describe('EventsNewComponent', () => {
  let component: EventsNewComponent;
  let fixture: ComponentFixture<EventsNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

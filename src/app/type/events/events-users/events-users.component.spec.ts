import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsUsersComponent } from './events-users.component';

describe('EventsUsersComponent', () => {
  let component: EventsUsersComponent;
  let fixture: ComponentFixture<EventsUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeagoComponent } from './timeago.component';

describe('TimeagoComponent', () => {
  let component: TimeagoComponent;
  let fixture: ComponentFixture<TimeagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

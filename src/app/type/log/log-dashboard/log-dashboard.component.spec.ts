import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogDashboardComponent } from './log-dashboard.component';

describe('LogDashboardComponent', () => {
  let component: LogDashboardComponent;
  let fixture: ComponentFixture<LogDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

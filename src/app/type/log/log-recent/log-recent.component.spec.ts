import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogRecentComponent } from './log-recent.component';

describe('LogRecentComponent', () => {
  let component: LogRecentComponent;
  let fixture: ComponentFixture<LogRecentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogRecentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

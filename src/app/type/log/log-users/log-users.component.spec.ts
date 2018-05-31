import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogUsersComponent } from './log-users.component';

describe('LogUsersComponent', () => {
  let component: LogUsersComponent;
  let fixture: ComponentFixture<LogUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

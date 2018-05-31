import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorRecentComponent } from './error-recent.component';

describe('ErrorRecentComponent', () => {
  let component: ErrorRecentComponent;
  let fixture: ComponentFixture<ErrorRecentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorRecentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

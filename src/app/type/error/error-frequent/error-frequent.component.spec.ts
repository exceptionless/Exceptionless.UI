import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorFrequentComponent } from './error-frequent.component';

describe('ErrorFrequentComponent', () => {
  let component: ErrorFrequentComponent;
  let fixture: ComponentFixture<ErrorFrequentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorFrequentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

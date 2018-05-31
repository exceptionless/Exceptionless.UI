import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogFrequentComponent } from './log-frequent.component';

describe('LogFrequentComponent', () => {
  let component: LogFrequentComponent;
  let fixture: ComponentFixture<LogFrequentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogFrequentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

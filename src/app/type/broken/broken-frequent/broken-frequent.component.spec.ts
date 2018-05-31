import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenFrequentComponent } from './broken-frequent.component';

describe('BrokenFrequentComponent', () => {
  let component: BrokenFrequentComponent;
  let fixture: ComponentFixture<BrokenFrequentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenFrequentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFrequentComponent } from './feature-frequent.component';

describe('FeatureFrequentComponent', () => {
  let component: FeatureFrequentComponent;
  let fixture: ComponentFixture<FeatureFrequentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureFrequentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureFrequentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

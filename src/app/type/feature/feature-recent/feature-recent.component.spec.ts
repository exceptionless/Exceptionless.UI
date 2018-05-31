import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureRecentComponent } from './feature-recent.component';

describe('FeatureRecentComponent', () => {
  let component: FeatureRecentComponent;
  let fixture: ComponentFixture<FeatureRecentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureRecentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

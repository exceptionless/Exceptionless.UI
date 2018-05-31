import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureNewComponent } from './feature-new.component';

describe('FeatureNewComponent', () => {
  let component: FeatureNewComponent;
  let fixture: ComponentFixture<FeatureNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

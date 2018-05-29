import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenComponent } from './broken.component';

describe('BrokenComponent', () => {
  let component: BrokenComponent;
  let fixture: ComponentFixture<BrokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

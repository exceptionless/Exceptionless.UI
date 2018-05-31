import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenRecentComponent } from './broken-recent.component';

describe('BrokenRecentComponent', () => {
  let component: BrokenRecentComponent;
  let fixture: ComponentFixture<BrokenRecentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenRecentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDateRangeDialogComponent } from './custom-date-range-dialog.component';

describe('CustomDateRangeDialogComponent', () => {
  let component: CustomDateRangeDialogComponent;
  let fixture: ComponentFixture<CustomDateRangeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomDateRangeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDateRangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

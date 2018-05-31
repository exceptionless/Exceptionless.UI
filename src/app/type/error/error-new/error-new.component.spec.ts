import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNewComponent } from './error-new.component';

describe('ErrorNewComponent', () => {
  let component: ErrorNewComponent;
  let fixture: ComponentFixture<ErrorNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

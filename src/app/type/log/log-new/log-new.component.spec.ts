import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogNewComponent } from './log-new.component';

describe('LogNewComponent', () => {
  let component: LogNewComponent;
  let fixture: ComponentFixture<LogNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

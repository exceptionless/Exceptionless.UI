import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenNewComponent } from './broken-new.component';

describe('BrokenNewComponent', () => {
  let component: BrokenNewComponent;
  let fixture: ComponentFixture<BrokenNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

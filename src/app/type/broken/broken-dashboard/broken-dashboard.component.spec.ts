import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenDashboardComponent } from './broken-dashboard.component';

describe('BrokenDashboardComponent', () => {
  let component: BrokenDashboardComponent;
  let fixture: ComponentFixture<BrokenDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

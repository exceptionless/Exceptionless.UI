import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokenUsersComponent } from './broken-users.component';

describe('BrokenUsersComponent', () => {
  let component: BrokenUsersComponent;
  let fixture: ComponentFixture<BrokenUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokenUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokenUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

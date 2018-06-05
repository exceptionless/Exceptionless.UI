import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationNotificationComponent } from './organization-notification.component';

describe('OrganizationNotificationComponent', () => {
  let component: OrganizationNotificationComponent;
  let fixture: ComponentFixture<OrganizationNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrganizationNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

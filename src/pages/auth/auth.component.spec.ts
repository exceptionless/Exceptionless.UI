import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthPageComponent } from './auth.component';

describe('AuthPageComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AuthPageComponent]
    }).compileComponents();
  }));

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app).toBeTruthy();
  });
});

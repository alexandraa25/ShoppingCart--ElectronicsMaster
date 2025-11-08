import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmarionRegisterComponent } from './email-confirmation-register.component';

describe('EmailConfirmarionRegisterComponent', () => {
  let component: EmailConfirmarionRegisterComponent;
  let fixture: ComponentFixture<EmailConfirmarionRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailConfirmarionRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailConfirmarionRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

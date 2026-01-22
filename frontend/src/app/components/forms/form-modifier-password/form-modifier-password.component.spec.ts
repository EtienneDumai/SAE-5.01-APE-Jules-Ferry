import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormModifierPasswordComponent } from './form-modifier-password.component';

describe('FormModifierPasswordComponent', () => {
  let component: FormModifierPasswordComponent;
  let fixture: ComponentFixture<FormModifierPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormModifierPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormModifierPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

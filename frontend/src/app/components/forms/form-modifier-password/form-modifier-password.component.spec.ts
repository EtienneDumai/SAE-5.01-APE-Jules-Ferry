/**
 * Fichier : frontend/src/app/components/forms/form-modifier-password/form-modifier-password.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant form modifier password.
 */

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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });
});

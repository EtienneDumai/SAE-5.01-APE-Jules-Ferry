/**
 * Fichier : frontend/src/app/components/password-confirm-modal/password-confirm-modal.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant password confirm modal.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PasswordConfirmModalComponent } from './password-confirm-modal.component';

describe('PasswordConfirmModalComponent', () => {
  let component: PasswordConfirmModalComponent;
  let fixture: ComponentFixture<PasswordConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create_component', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Logique du composant', () => {
    it('should_emit_confirmation_empty_lors_oui', () => {
    // GIVEN
      spyOn(component.confirmPassword, 'emit');

    // WHEN
      component.onConfirm();

    // THEN
      expect(component.confirmPassword.emit).toHaveBeenCalledWith('');
    });

    it('should_emit_event_cancel_when_annulation', () => {
    // GIVEN
      spyOn(component.cancelModal, 'emit');

    // WHEN
      component.onCancel();

    // THEN
      expect(component.cancelModal.emit).toHaveBeenCalled();
    });
  });

  describe('Interactions avec le DOM', () => {
    it('should_display_text_confirmation', () => {
    // GIVEN

    // WHEN
      const text = fixture.debugElement.query(By.css('p')).nativeElement.textContent;

    // THEN
      expect(text).toContain('Êtes-vous sûr de vouloir effectuer cette action');
    });

    it('should_call_onconfirm_lors_clic_bouton_oui', () => {
    // GIVEN
      spyOn(component, 'onConfirm');

    // WHEN
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const confirmButton = buttons.find((button) => button.nativeElement.textContent.trim() === 'Oui');

      confirmButton?.triggerEventHandler('click', null);

    // THEN
      expect(component.onConfirm).toHaveBeenCalled();
    });

    it('should_call_oncancel_lors_clic_bouton_non', () => {
    // GIVEN
      spyOn(component, 'onCancel');

    // WHEN
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find((button) => button.nativeElement.textContent.trim() === 'Non');

      cancelButton?.triggerEventHandler('click', null);

    // THEN
      expect(component.onCancel).toHaveBeenCalled();
    });
  });
});

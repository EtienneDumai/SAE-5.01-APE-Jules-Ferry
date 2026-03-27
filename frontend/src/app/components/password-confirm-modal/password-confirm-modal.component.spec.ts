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

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  describe('Logique du composant', () => {
    it('devrait emettre une confirmation vide lors du oui', () => {
      spyOn(component.confirmPassword, 'emit');

      component.onConfirm();

      expect(component.confirmPassword.emit).toHaveBeenCalledWith('');
    });

    it('devrait emettre l evenement cancel lors de l annulation', () => {
      spyOn(component.cancelModal, 'emit');

      component.onCancel();

      expect(component.cancelModal.emit).toHaveBeenCalled();
    });
  });

  describe('Interactions avec le DOM', () => {
    it('devrait afficher le texte de confirmation', () => {
      const text = fixture.debugElement.query(By.css('p')).nativeElement.textContent;

      expect(text).toContain('Etes-vous sur');
    });

    it('devrait appeler onConfirm lors du clic sur le bouton Oui', () => {
      spyOn(component, 'onConfirm');
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const confirmButton = buttons.find((button) => button.nativeElement.textContent.trim() === 'Oui');

      confirmButton?.triggerEventHandler('click', null);

      expect(component.onConfirm).toHaveBeenCalled();
    });

    it('devrait appeler onCancel lors du clic sur le bouton Non', () => {
      spyOn(component, 'onCancel');
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find((button) => button.nativeElement.textContent.trim() === 'Non');

      cancelButton?.triggerEventHandler('click', null);

      expect(component.onCancel).toHaveBeenCalled();
    });
  });
});

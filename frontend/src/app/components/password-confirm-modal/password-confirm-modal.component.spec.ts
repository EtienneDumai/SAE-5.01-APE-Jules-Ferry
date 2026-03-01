import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordConfirmModalComponent } from './password-confirm-modal.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('PasswordConfirmModalComponent', () => {
  let component: PasswordConfirmModalComponent;
  let fixture: ComponentFixture<PasswordConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordConfirmModalComponent, FormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PasswordConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  describe('Logique du composant', () => {
    it('devrait avoir un mot de passe vide à l\'initialisation', () => {
      expect(component.password).toBe('');
    });

    it('ne devrait pas émettre d\'événement confirm si le mot de passe est vide', () => {
      spyOn(component.confirm, 'emit');
      component.password = '';

      component.onConfirm();

      expect(component.confirm.emit).not.toHaveBeenCalled();
    });

    it('devrait émettre l\'événement confirm avec le mot de passe s\'il n\'est pas vide, puis le réinitialiser', () => {
      spyOn(component.confirm, 'emit');
      component.password = 'monMotDePasseSecret';

      component.onConfirm();

      expect(component.confirm.emit).toHaveBeenCalledWith('monMotDePasseSecret');
      expect(component.password).toBe('');
    });

    it('devrait émettre l\'événement cancel et réinitialiser le mot de passe lors de l\'annulation', () => {
      spyOn(component.cancel, 'emit');
      component.password = 'test';

      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
      expect(component.password).toBe('');
    });
  });

  describe('Interactions avec le DOM', () => {
    it('devrait mettre à jour la propriété password quand l\'utilisateur tape dans l\'input', async () => {
      const inputElement = fixture.debugElement.query(By.css('input[type="password"]')).nativeElement;

      inputElement.value = 'nouveauMotDePasse';
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.password).toBe('nouveauMotDePasse');
    });

    it('devrait appeler onConfirm quand on appuie sur Entrée dans l\'input', () => {
      spyOn(component, 'onConfirm');
      const inputElement = fixture.debugElement.query(By.css('input[type="password"]'));

      inputElement.triggerEventHandler('keyup.enter', {});

      expect(component.onConfirm).toHaveBeenCalled();
    });

    it('devrait appeler onConfirm lors du clic sur le bouton Confirmer', () => {
      spyOn(component, 'onConfirm');
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const confirmButton = buttons.find(b => b.nativeElement.textContent.trim() === 'Confirmer');

      confirmButton?.triggerEventHandler('click', null);

      expect(component.onConfirm).toHaveBeenCalled();
    });

    it('devrait appeler onCancel lors du clic sur le bouton Annuler', () => {
      spyOn(component, 'onCancel');
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const cancelButton = buttons.find(b => b.nativeElement.textContent.trim() === 'Annuler');

      cancelButton?.triggerEventHandler('click', null);

      expect(component.onCancel).toHaveBeenCalled();
    });
  });
});

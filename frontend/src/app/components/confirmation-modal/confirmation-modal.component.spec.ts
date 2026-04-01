/**
 * Fichier : frontend/src/app/components/confirmation-modal/confirmation-modal.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant confirmation modal.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('émet validateAction quand confirmer est appelé', () => {
    spyOn(component.validateAction, 'emit');

    component.confirmer();

    expect(component.validateAction.emit).toHaveBeenCalled();
  });

  it('émet cancelAction quand annuler est appelé', () => {
    spyOn(component.cancelAction, 'emit');

    component.annuler();

    expect(component.cancelAction.emit).toHaveBeenCalled();
  });
});

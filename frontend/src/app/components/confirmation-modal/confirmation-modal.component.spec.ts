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

  it('should_create', () => {
    // GIVEN

    // WHEN

    // THEN
    expect(component).toBeTruthy();
  });

  it('should_emit_validateaction_when_confirmer_appele', () => {
    // GIVEN
    spyOn(component.validateAction, 'emit');

    // WHEN
    component.confirmer();

    // THEN
    expect(component.validateAction.emit).toHaveBeenCalled();
  });

  it('should_emit_cancelaction_when_annuler_appele', () => {
    // GIVEN
    spyOn(component.cancelAction, 'emit');

    // WHEN
    component.annuler();

    // THEN
    expect(component.cancelAction.emit).toHaveBeenCalled();
  });
});

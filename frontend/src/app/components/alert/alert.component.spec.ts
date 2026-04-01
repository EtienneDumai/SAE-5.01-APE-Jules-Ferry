/**
 * Fichier : frontend/src/app/components/alert/alert.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant alert.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  it('should_emit_valider_when_call_onvalider', () => {
  // GIVEN
    spyOn(component.valider, 'emit');

  // WHEN
    component.onValider();

  // THEN
    expect(component.valider.emit).toHaveBeenCalled();
  });

  it('should_emit_annuler_when_call_onannuler', () => {
  // GIVEN
    spyOn(component.annuler, 'emit');

  // WHEN
    component.onAnnuler();

  // THEN
    expect(component.annuler.emit).toHaveBeenCalled();
  });
});

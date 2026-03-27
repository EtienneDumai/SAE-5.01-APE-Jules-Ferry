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

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });
});

/**
 * Fichier : frontend/src/app/pages/politique-confidentialite/politique-confidentialite.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page politique confidentialite.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolitiqueConfidentialiteComponent } from './politique-confidentialite.component';

describe('PolitiqueConfidentialiteComponent', () => {
  let component: PolitiqueConfidentialiteComponent;
  let fixture: ComponentFixture<PolitiqueConfidentialiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolitiqueConfidentialiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolitiqueConfidentialiteComponent);
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

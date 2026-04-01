/**
 * Fichier : frontend/src/app/components/forms/form-inscription-evenement/form-inscription-evenement.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant form inscription evenement.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInscriptionEvenementComponent } from './form-inscription-evenement.component';
import { Formulaire } from '../../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../../enums/StatutFormulaire/statut-formulaire';

describe('FormInscriptionEvenementComponent', () => {
  let component: FormInscriptionEvenementComponent;
  let fixture: ComponentFixture<FormInscriptionEvenementComponent>;

  const mockFormulaire: Formulaire = {
    id_formulaire: 1,
    nom_formulaire: 'Test Formulaire',
    description: 'Description test',
    statut: StatutFormulaire.actif,
    id_createur: 1,
    taches: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInscriptionEvenementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInscriptionEvenementComponent);
    component = fixture.componentInstance;
    
    // Initialiser les inputs requis
    component.formulaire = mockFormulaire;
    component.mesCreneauxActuels = [];
    component.isCreneauComplet = () => false;
    component.getPlacesRestantes = () => 10;
    
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });
});


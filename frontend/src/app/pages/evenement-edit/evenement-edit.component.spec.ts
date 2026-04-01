/**
 * Fichier : frontend/src/app/pages/evenement-edit/evenement-edit.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page evenement edit.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EvenementEditComponent } from './evenement-edit.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { ToastService } from '../../services/Toast/toast.service';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';

describe('EvenementEditComponent', () => {
  let component: EvenementEditComponent;
  let fixture: ComponentFixture<EvenementEditComponent>;
  let formulaireServiceSpy: jasmine.SpyObj<FormulaireService>;

  const activeTemplate: Formulaire = {
    id_formulaire: 1,
    nom_formulaire: 'Modele actif',
    description: 'Description',
    statut: StatutFormulaire.actif,
    is_template: true,
    id_createur: 1,
    taches: []
  };

  beforeEach(async () => {
    formulaireServiceSpy = jasmine.createSpyObj('FormulaireService', ['getTemplates']);
    formulaireServiceSpy.getTemplates.and.returnValue(of([activeTemplate]));

    await TestBed.configureTestingModule({
      imports: [EvenementEditComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'new' } }
          }
        },
        {
          provide: EvenementService,
          useValue: jasmine.createSpyObj('EvenementService', ['getEvenementById', 'createEvenement', 'updateEvenement'])
        },
        { provide: FormulaireService, useValue: formulaireServiceSpy },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvenementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  it('should_load_only_active_templates_for_event_creation', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(formulaireServiceSpy.getTemplates).toHaveBeenCalledWith(StatutFormulaire.actif);
    expect(component.templates).toEqual([activeTemplate]);
    expect(component.loading).toBeFalse();
  });

  it('should_flag_warning_when_task_starts_before_event_without_making_it_invalid', () => {
  // GIVEN
    component.evenementForm.patchValue({
      heure_debut: '09:00',
      heure_fin: '18:00'
    });

  // WHEN
    component.addTache({
      nom_tache: 'Accueil',
      heure_debut_globale: '08:30',
      heure_fin_globale: '10:00',
      creneaux: []
    });

    const tache = component.taches.at(0);

  // THEN
    expect(tache.errors?.['taskOutsideEventBounds']).toBeFalsy();
    expect(component.isTaskOutsideEventBounds(tache)).toBeTrue();
  });

  it('should_flag_warning_when_task_ends_after_event_without_making_it_invalid', () => {
  // GIVEN
    component.evenementForm.patchValue({
      heure_debut: '09:00',
      heure_fin: '18:00'
    });

  // WHEN
    component.addTache({
      nom_tache: 'Rangement',
      heure_debut_globale: '17:00',
      heure_fin_globale: '18:30',
      creneaux: []
    });

    const tache = component.taches.at(0);

  // THEN
    expect(tache.errors?.['taskOutsideEventBounds']).toBeFalsy();
    expect(component.isTaskOutsideEventBounds(tache)).toBeTrue();
  });

  it('should_refresh_task_bounds_warning_when_event_hours_change', () => {
  // GIVEN
    component.evenementForm.patchValue({
      heure_debut: '09:00',
      heure_fin: '18:00'
    });

  // WHEN
    component.addTache({
      nom_tache: 'Accueil',
      heure_debut_globale: '09:30',
      heure_fin_globale: '10:30',
      creneaux: []
    });

    const tache = component.taches.at(0);

  // THEN
    expect(component.isTaskOutsideEventBounds(tache)).toBeFalse();
    component.evenementForm.patchValue({ heure_fin: '10:00' });
    expect(component.isTaskOutsideEventBounds(tache)).toBeTrue();
  });
});

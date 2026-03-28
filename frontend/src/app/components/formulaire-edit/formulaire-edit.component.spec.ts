/**
 * Fichier : frontend/src/app/components/formulaire-edit/formulaire-edit.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant formulaire edit.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { FormulaireEditComponent } from './formulaire-edit.component';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { ToastService } from '../../services/Toast/toast.service';

describe('FormulaireEditComponent', () => {
  let component: FormulaireEditComponent;
  let fixture: ComponentFixture<FormulaireEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireEditComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'new' } }
          }
        },
        {
          provide: Router,
          useValue: {
            url: '/admin/formulaires/new'
          }
        },
        {
          provide: FormulaireService,
          useValue: {
            getFormulaireById: jasmine.createSpy('getFormulaireById').and.returnValue(of())
          }
        },
        {
          provide: ToastService,
          useValue: {
            showWithTimeout: jasmine.createSpy('showWithTimeout')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the formulaire status field', () => {
    const select: HTMLSelectElement | null = fixture.nativeElement.querySelector('#statut_formulaire');

    expect(select).not.toBeNull();
    expect(select?.value).toBe('actif');
  });

  it('should return structured validation errors with a contexte', () => {
    const tache = component.taches.at(0);
    tache.patchValue({
      nom_tache: 'Accueil',
      heure_debut_globale: '08:00',
      heure_fin_globale: '07:00'
    });
    component.getCreneaux(0).clear();

    const erreurs = component.validerLogique();

    expect(erreurs).toEqual([
      {
        contexte: 'Accueil',
        message: 'Fin (07:00) doit être après Début (08:00).'
      }
    ]);
  });
});

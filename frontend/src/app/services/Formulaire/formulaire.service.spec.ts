/**
 * Fichier : frontend/src/app/services/Formulaire/formulaire.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Formulaire.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormulaireService } from './formulaire.service';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';
import { environment } from '../../environments/environment';

describe('FormulaireService', () => {
  let service: FormulaireService;
  let httpMock: HttpTestingController;

  const mockFormulaire: Formulaire = {
    id_formulaire: 1,
    nom_formulaire: 'Formulaire test',
    description: 'Description test',
    statut: StatutFormulaire.actif,
    id_createur: 1,
    taches: []
  };

  const mockArchivedFormulaire: Formulaire = {
    id_formulaire: 2,
    nom_formulaire: 'Formulaire archive',
    description: 'Description archive',
    statut: StatutFormulaire.archive,
    id_createur: 1,
    taches: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    service = TestBed.inject(FormulaireService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait etre cree', () => {
    expect(service).toBeTruthy();
  });

  it('getAllFormulaires doit appeler la route de liste', () => {
    service.getAllFormulaires().subscribe(formulaires => {
      expect(formulaires).toEqual([mockFormulaire, mockArchivedFormulaire]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
    expect(req.request.method).toBe('GET');
    req.flush([mockFormulaire, mockArchivedFormulaire]);
  });

  it('getTemplates doit appeler la route des templates', () => {
    const expectedTemplates = [{ ...mockFormulaire, is_template: true }];

    service.getTemplates().subscribe(formulaires => {
      expect(formulaires).toEqual(expectedTemplates);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires?is_template=1`);
    expect(req.request.method).toBe('GET');
    req.flush(expectedTemplates);
  });

  it('getTemplates doit pouvoir filtrer les templates actifs', () => {
    service.getTemplates(StatutFormulaire.actif).subscribe(formulaires => {
      expect(formulaires).toEqual([{ ...mockFormulaire, is_template: true }]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires?is_template=1&statut=actif`);
    expect(req.request.method).toBe('GET');
    req.flush([{ ...mockFormulaire, is_template: true }]);
  });

  it('getFormulaireById doit charger un formulaire', () => {
    service.getFormulaireById(1).subscribe(formulaire => {
      expect(formulaire).toEqual(mockFormulaire);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFormulaire);
  });

  it('createFormulaire doit poster le formulaire', () => {
    service.createFormulaire(mockFormulaire).subscribe(formulaire => {
      expect(formulaire).toEqual(mockFormulaire);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockFormulaire);
    req.flush(mockFormulaire);
  });

  it('updateFormulaire doit mettre a jour un formulaire', () => {
    service.updateFormulaire(mockArchivedFormulaire, 2).subscribe(formulaire => {
      expect(formulaire.statut).toBe(StatutFormulaire.archive);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockArchivedFormulaire);
    req.flush(mockArchivedFormulaire);
  });

  it('deleteFormulaire doit supprimer un formulaire', () => {
    service.deleteFormulaire(2).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

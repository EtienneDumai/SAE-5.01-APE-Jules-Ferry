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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  it('should_getallformulaires_doit_call_route_liste', () => {
  // GIVEN

  // WHEN
    service.getAllFormulaires().subscribe(formulaires => {

  // THEN
      expect(formulaires).toEqual([mockFormulaire, mockArchivedFormulaire]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
    expect(req.request.method).toBe('GET');
    req.flush([mockFormulaire, mockArchivedFormulaire]);
  });

  it('should_gettemplates_doit_call_route_templates', () => {
  // GIVEN
    const expectedTemplates = [{ ...mockFormulaire, is_template: true }];

  // WHEN
    service.getTemplates().subscribe(formulaires => {

  // THEN
      expect(formulaires).toEqual(expectedTemplates);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires?is_template=1`);
    expect(req.request.method).toBe('GET');
    req.flush(expectedTemplates);
  });

  it('should_gettemplates_doit_pouvoir_filtrer_templates_actifs', () => {
  // GIVEN

  // WHEN
    service.getTemplates(StatutFormulaire.actif).subscribe(formulaires => {

  // THEN
      expect(formulaires).toEqual([{ ...mockFormulaire, is_template: true }]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires?is_template=1&statut=actif`);
    expect(req.request.method).toBe('GET');
    req.flush([{ ...mockFormulaire, is_template: true }]);
  });

  it('should_getformulairebyid_doit_load_form', () => {
  // GIVEN

  // WHEN
    service.getFormulaireById(1).subscribe(formulaire => {

  // THEN
      expect(formulaire).toEqual(mockFormulaire);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFormulaire);
  });

  it('should_createformulaire_doit_poster_form', () => {
  // GIVEN

  // WHEN
    service.createFormulaire(mockFormulaire).subscribe(formulaire => {

  // THEN
      expect(formulaire).toEqual(mockFormulaire);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockFormulaire);
    req.flush(mockFormulaire);
  });

  it('should_updateformulaire_doit_update_form', () => {
  // GIVEN

  // WHEN
    service.updateFormulaire(mockArchivedFormulaire, 2).subscribe(formulaire => {

  // THEN
      expect(formulaire.statut).toBe(StatutFormulaire.archive);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockArchivedFormulaire);
    req.flush(mockArchivedFormulaire);
  });

  it('should_deleteformulaire_doit_delete_form', () => {
  // GIVEN

  // WHEN
    service.deleteFormulaire(2).subscribe(response => {

  // THEN
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FormulaireService } from './formulaire.service';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';
import { environment } from '../../environments/environment.dev';

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

  const mockFormulaireArchive: Formulaire[] = [
    mockFormulaire,
    {
      id_formulaire: 2,
      nom_formulaire: 'Formulaire test 2',
      description: 'Description test 2',
      statut: StatutFormulaire.archive,
      id_createur: 1,
      taches: []
    }
  ];

  const mockFormulaireCloture: Formulaire = {
    id_formulaire: 0,
    nom_formulaire: 'Nouveau formulaire',
    description: 'Nouvelle description',
    statut: StatutFormulaire.cloture,
    id_createur: 1,
    taches: []
  };
  const mockFormulaires: Formulaire[] = [
    mockFormulaire,
    {
      id_formulaire: 2,
      nom_formulaire: 'Formulaire test 2',
      description: 'Description test 2',
      statut: StatutFormulaire.actif,
      id_createur: 1,
      taches: []
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    
    service = TestBed.inject(FormulaireService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllFormulaires', () => {
    it('devrait retourner un tableau de formulaires', () => {
      service.getAllFormulaires().subscribe(formulaires => {
        expect(formulaires).toEqual(mockFormulaires);
        expect(formulaires.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFormulaires);
    });

    it('devrait retourner un tableau vide quand aucun formulaire', () => {
      service.getAllFormulaires().subscribe(formulaires => {
        expect(formulaires).toEqual([]);
        expect(formulaires.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      req.flush([]);
    });

    it('devrait gérer l\'erreur quand getAllFormulaires échoue', () => {
      const errorMessage = 'Server error';

      service.getAllFormulaires().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('devrait retourner des formulaires avec différents statuts', () => {
      service.getAllFormulaires().subscribe(formulaires => {
        expect(formulaires).toEqual(mockFormulaireArchive);
        expect(formulaires[0].statut).toBe(StatutFormulaire.actif);
        expect(formulaires[1].statut).toBe(StatutFormulaire.archive);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      req.flush(mockFormulaireArchive);
    });
  });

  describe('getFormulaireById', () => {
    it('devrait retourner un formulaire unique par son id', () => {
      const formulaireId = 1;

      service.getFormulaireById(formulaireId).subscribe(formulaire => {
        expect(formulaire).toEqual(mockFormulaire);
        expect(formulaire.id_formulaire).toBe(formulaireId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFormulaire);
    });

    it('devrait gérer l\'erreur quand le formulaire n\'est pas trouvé', () => {
      const formulaireId = 999;

      service.getFormulaireById(formulaireId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('devrait retourner un formulaire avec le statut archivé', () => {
      const formulaireId = 2;

      service.getFormulaireById(formulaireId).subscribe(formulaire => {
        expect(formulaire.statut).toBe(StatutFormulaire.archive);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush(mockFormulaireArchive[1]);
    });
  });

  describe('createFormulaire', () => {
    it('devrait créer un nouveau formulaire', () => {
      const newFormulaire: Formulaire = {
        id_formulaire: 0,
        nom_formulaire: 'Nouveau formulaire',
        description: 'Nouvelle description',
        statut: StatutFormulaire.actif,
        id_createur: 1,
        taches: []
      };

      const createdFormulaire = { ...newFormulaire, id_formulaire: 3 };

      service.createFormulaire(newFormulaire).subscribe(formulaire => {
        expect(formulaire).toEqual(createdFormulaire);
        expect(formulaire.id_formulaire).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newFormulaire);
      req.flush(createdFormulaire);
    });

    it('devrait gérer l\'erreur quand la création échoue', () => {
      const newFormulaire: Formulaire = {
        id_formulaire: 0,
        nom_formulaire: 'Nouveau formulaire',
        description: 'Nouvelle description',
        statut: StatutFormulaire.actif,
        id_createur: 1,
        taches: []
      };

      service.createFormulaire(newFormulaire).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });

    it('devrait créer un formulaire avec le statut clôturé', () => {
      const createdFormulaire = { ...mockFormulaireCloture, id_formulaire: 4 };

      service.createFormulaire(mockFormulaireCloture).subscribe(formulaire => {
        expect(formulaire.statut).toBe(StatutFormulaire.cloture);
        expect(formulaire.id_formulaire).toBe(4);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires`);
      req.flush(createdFormulaire);
    });
  });

  describe('updateFormulaire', () => {
    it('devrait mettre à jour un formulaire existant', () => {
      const formulaireId = 1;
      const updatedFormulaire: Formulaire = {
        ...mockFormulaire,
        nom_formulaire: 'Formulaire modifié'
      };

      service.updateFormulaire(updatedFormulaire, formulaireId).subscribe(formulaire => {
        expect(formulaire).toEqual(updatedFormulaire);
        expect(formulaire.nom_formulaire).toBe('Formulaire modifié');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedFormulaire);
      req.flush(updatedFormulaire);
    });

    it('devrait gérer l\'erreur quand la mise à jour échoue', () => {
      const formulaireId = 999;

      service.updateFormulaire(mockFormulaire, formulaireId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('devrait mettre à jour le statut du formulaire vers archivé', () => {
      const formulaireId = 1;
      const archivedFormulaire: Formulaire = {
        ...mockFormulaire,
        statut: StatutFormulaire.archive
      };

      service.updateFormulaire(archivedFormulaire, formulaireId).subscribe(formulaire => {
        expect(formulaire.statut).toBe(StatutFormulaire.archive);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush(archivedFormulaire);
    });

    it('devrait mettre à jour plusieurs champs du formulaire', () => {
      const formulaireId = 1;
      const updatedFormulaire: Formulaire = {
        ...mockFormulaire,
        nom_formulaire: 'Nouveau nom',
        description: 'Nouvelle description',
        statut: StatutFormulaire.cloture
      };

      service.updateFormulaire(updatedFormulaire, formulaireId).subscribe(formulaire => {
        expect(formulaire.nom_formulaire).toBe('Nouveau nom');
        expect(formulaire.description).toBe('Nouvelle description');
        expect(formulaire.statut).toBe(StatutFormulaire.cloture);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush(updatedFormulaire);
    });
  });

  describe('deleteFormulaire', () => {
    it('devrait supprimer un formulaire par son id', () => {
      const formulaireId = 1;

      service.deleteFormulaire(formulaireId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('devrait gérer l\'erreur quand la suppression échoue', () => {
      const formulaireId = 999;

      service.deleteFormulaire(formulaireId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('devrait gérer une suppression non autorisée', () => {
      const formulaireId = 1;

      service.deleteFormulaire(formulaireId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/formulaires/${formulaireId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
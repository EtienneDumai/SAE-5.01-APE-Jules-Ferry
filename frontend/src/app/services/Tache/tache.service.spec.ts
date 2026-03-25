import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TacheService } from './tache.service';
import { Tache } from '../../models/Tache/tache';
import { environment } from '../../environments/environment';

describe('TacheService', () => {
  let service: TacheService;
  let httpMock: HttpTestingController;

  const mockTache: Tache = {
    id_tache: 1,
    nom_tache: 'Tâche test',
    description: 'Description test',
    id_formulaire: 1,
    heure_debut_globale: '09:00',
    heure_fin_globale: '11:00',
    creneaux: []
  };

  const mockTaches: Tache[] = [
    mockTache,
    {
      id_tache: 2,
      nom_tache: 'Tâche test 2',
      description: 'Description test 2',
      heure_debut_globale: '13:00',
      heure_fin_globale: '15:00',
      id_formulaire: 1,
      creneaux: []
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    
    service = TestBed.inject(TacheService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTaches', () => {
    it('devrait retourner un tableau de tâches', () => {
      service.getAllTaches().subscribe(taches => {
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('devrait retourner un tableau vide quand aucune tâche', () => {
      service.getAllTaches().subscribe(taches => {
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush([]);
    });

    it('devrait gérer l\'erreur quand getAllTaches échoue', () => {
      const errorMessage = 'Server error';

      service.getAllTaches().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getTacheById', () => {
    it('devrait retourner une tâche unique par son id', () => {
      const tacheId = 1;

      service.getTacheById(tacheId).subscribe(tache => {
        expect(tache).toEqual(mockTache);
        expect(tache.id_tache).toBe(tacheId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTache);
    });

    it('devrait gérer l\'erreur quand la tâche n\'est pas trouvée', () => {
      const tacheId = 999;

      service.getTacheById(tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTache', () => {
    it('devrait créer une nouvelle tâche', () => {
      const newTache: Tache = {
        id_tache: 0,
        nom_tache: 'Nouvelle tâche',
        description: 'Nouvelle description',
        heure_debut_globale: '10:00',
        heure_fin_globale: '12:00',
        id_formulaire: 1,
        creneaux: []
      };

      const createdTache = { ...newTache, id_tache: 3 };

      service.createTache(newTache).subscribe(tache => {
        expect(tache).toEqual(createdTache);
        expect(tache.id_tache).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTache);
      req.flush(createdTache);
    });

    it('devrait gérer l\'erreur quand la création échoue', () => {
      const newTache: Tache = {
        id_tache: 0,
        nom_tache: 'Nouvelle tâche',
        description: 'Nouvelle description',
        heure_debut_globale: '10:00',
        heure_fin_globale: '12:00',
        id_formulaire: 1,
        creneaux: []
      };

      service.createTache(newTache).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateTache', () => {
    it('devrait mettre à jour une tâche existante', () => {
      const tacheId = 1;
      const updatedTache: Tache = {
        ...mockTache,
        nom_tache: 'Tâche modifiée'
      };

      service.updateTache(updatedTache, tacheId).subscribe(tache => {
        expect(tache).toEqual(updatedTache);
        expect(tache.nom_tache).toBe('Tâche modifiée');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedTache);
      req.flush(updatedTache);
    });

    it('devrait gérer l\'erreur quand la mise à jour échoue', () => {
      const tacheId = 999;

      service.updateTache(mockTache, tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteTache', () => {
    it('devrait supprimer une tâche par son id', () => {
      const tacheId = 1;

      service.deleteTache(tacheId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('devrait gérer l\'erreur quand la suppression échoue', () => {
      const tacheId = 999;

      service.deleteTache(tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAlltachesByIdEvennement', () => {
    it('devrait retourner toutes les tâches pour un événement spécifique', () => {
      const evenementId = 1;

      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('devrait retourner un tableau vide quand l\'événement n\'a pas de tâches', () => {
      const evenementId = 2;

      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      req.flush([]);
    });

    it('devrait gérer l\'erreur quand l\'événement n\'est pas trouvé', () => {
      const evenementId = 999;

      service.getAlltachesByIdEvennement(evenementId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

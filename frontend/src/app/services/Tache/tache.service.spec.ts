import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TacheService } from './tache.service';
import { Tache } from '../../models/Tache/tache';
import { environment } from '../../environments/environment.dev';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTaches', () => {
    it('should return an array of taches', () => {
      service.getAllTaches().subscribe(taches => {
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('should return empty array when no taches', () => {
      service.getAllTaches().subscribe(taches => {
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush([]);
    });

    it('should handle error when getAllTaches fails', () => {
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
    it('should return a single tache by id', () => {
      const tacheId = 1;

      service.getTacheById(tacheId).subscribe(tache => {
        expect(tache).toEqual(mockTache);
        expect(tache.id_tache).toBe(tacheId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTache);
    });

    it('should handle error when tache not found', () => {
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
    it('should create a new tache', () => {
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

    it('should handle error when create fails', () => {
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
    it('should update an existing tache', () => {
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

    it('should handle error when update fails', () => {
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
    it('should delete a tache by id', () => {
      const tacheId = 1;

      service.deleteTache(tacheId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when delete fails', () => {
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
    it('should return all taches for a specific evenement', () => {
      const evenementId = 1;

      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('should return empty array when evenement has no taches', () => {
      const evenementId = 2;

      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      req.flush([]);
    });

    it('should handle error when evenement not found', () => {
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

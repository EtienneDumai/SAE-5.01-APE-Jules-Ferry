/**
 * Fichier : frontend/src/app/services/Tache/tache.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Tache.
 */

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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('getAllTaches', () => {
    it('should_return_tableau_taches', () => {
    // GIVEN

    // WHEN
      service.getAllTaches().subscribe(taches => {

    // THEN
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('should_return_tableau_empty_when_no_tache', () => {
    // GIVEN

    // WHEN
      service.getAllTaches().subscribe(taches => {

    // THEN
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush([]);
    });

    it('should_handle_erreur_quand_getalltaches_echoue', () => {
    // GIVEN
      const errorMessage = 'Server error';

    // WHEN
      service.getAllTaches().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getTacheById', () => {
    it('should_return_tache_unique_par_id', () => {
    // GIVEN
      const tacheId = 1;

    // WHEN
      service.getTacheById(tacheId).subscribe(tache => {

    // THEN
        expect(tache).toEqual(mockTache);
        expect(tache.id_tache).toBe(tacheId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTache);
    });

    it('should_handle_erreur_quand_la_tache_n_est_pas_trouvee', () => {
    // GIVEN
      const tacheId = 999;

    // WHEN
      service.getTacheById(tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTache', () => {
    it('should_create_nouvelle_tache', () => {
    // GIVEN
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

    // WHEN
      service.createTache(newTache).subscribe(tache => {

    // THEN
        expect(tache).toEqual(createdTache);
        expect(tache.id_tache).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTache);
      req.flush(createdTache);
    });

    it('should_handle_erreur_quand_la_creation_echoue', () => {
    // GIVEN
      const newTache: Tache = {
        id_tache: 0,
        nom_tache: 'Nouvelle tâche',
        description: 'Nouvelle description',
        heure_debut_globale: '10:00',
        heure_fin_globale: '12:00',
        id_formulaire: 1,
        creneaux: []
      };

    // WHEN
      service.createTache(newTache).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateTache', () => {
    it('should_update_tache_existante', () => {
    // GIVEN
      const tacheId = 1;
      const updatedTache: Tache = {
        ...mockTache,
        nom_tache: 'Tâche modifiée'
      };

    // WHEN
      service.updateTache(updatedTache, tacheId).subscribe(tache => {

    // THEN
        expect(tache).toEqual(updatedTache);
        expect(tache.nom_tache).toBe('Tâche modifiée');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedTache);
      req.flush(updatedTache);
    });

    it('should_handle_erreur_quand_la_mise_a_jour_echoue', () => {
    // GIVEN
      const tacheId = 999;

    // WHEN
      service.updateTache(mockTache, tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteTache', () => {
    it('should_delete_tache_par_id', () => {
    // GIVEN
      const tacheId = 1;

    // WHEN
      service.deleteTache(tacheId).subscribe(response => {

    // THEN
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should_handle_erreur_quand_la_suppression_echoue', () => {
    // GIVEN
      const tacheId = 999;

    // WHEN
      service.deleteTache(tacheId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/taches/${tacheId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getAlltachesByIdEvennement', () => {
    it('should_return_all_taches_event_specifique', () => {
    // GIVEN
      const evenementId = 1;

    // WHEN
      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {

    // THEN
        expect(taches).toEqual(mockTaches);
        expect(taches.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaches);
    });

    it('should_return_tableau_empty_when_evenement_n_a_pas_de_taches', () => {
    // GIVEN
      const evenementId = 2;

    // WHEN
      service.getAlltachesByIdEvennement(evenementId).subscribe(taches => {

    // THEN
        expect(taches).toEqual([]);
        expect(taches.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      req.flush([]);
    });

    it('should_handle_erreur_quand_l_evenement_n_est_pas_trouve', () => {
    // GIVEN
      const evenementId = 999;

    // WHEN
      service.getAlltachesByIdEvennement(evenementId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/evennements/${evenementId}/taches`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

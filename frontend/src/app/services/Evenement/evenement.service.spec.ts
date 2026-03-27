/**
 * Fichier : frontend/src/app/services/Evenement/evenement.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Evenement.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EvenementService } from './evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { environment } from '../../environments/environment';

describe('EvenementService', () => {
  let service: EvenementService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockEvenement: Evenement = {
    id_evenement: 1,
    titre: 'Test Event',
    description: 'Test Description',
    date_evenement: new Date('2026-02-01'),
    heure_debut: '10:00',
    heure_fin: '12:00',
    lieu: 'Test Location',
    image_url: 'https://example.com/image.jpg',
    statut: StatutEvenement.brouillon,
    id_auteur: 1,
    id_formulaire: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  };

  const mockEvenements: Evenement[] = [
    mockEvenement,
    {
      id_evenement: 2,
      titre: 'Second Event',
      description: 'Second Description',
      date_evenement: new Date('2026-03-01'),
      heure_debut: '14:00',
      heure_fin: '16:00',
      lieu: 'Another Location',
      image_url: 'https://example.com/image2.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 2,
      id_formulaire: 1,
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(EvenementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllEvenements', () => {
    it('devrait récupérer tous les événements', () => {
      service.getAllEvenements().subscribe({
        next: (response) => {
          expect(response.data).toEqual(mockEvenements);
          expect(response.total).toBe(2);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockEvenements, current_page: 1, last_page: 1, total: 2 });
    });

    it('devrait retourner un tableau vide quand aucun événement n\'existe', () => {
      service.getAllEvenements().subscribe({
        next: (response) => {
          expect(response.data).toEqual([]);
          expect(response.total).toBe(0);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], current_page: 1, last_page: 1, total: 0 });
    });

    it('devrait gérer les erreurs lors de la récupération des événements', () => {
      const errorMessage = 'Server error';

      service.getAllEvenements().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getEvenementById', () => {
    it('devrait récupérer un événement spécifique par son id', () => {
      const evenementId = 1;

      service.getEvenementById(evenementId).subscribe({
        next: (evenement) => {
          expect(evenement).toEqual(mockEvenement);
          expect(evenement.id_evenement).toBe(evenementId);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvenement);
    });

    it('devrait gérer l\'erreur 404 quand l\'événement n\'est pas trouvé', () => {
      const evenementId = 999;

      service.getEvenementById(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createEvenement', () => {
    it('devrait créer un nouvel événement avec un objet Evenement', () => {
      const newEvenement: Evenement = {
        id_evenement: 0,
        titre: 'New Event',
        description: 'New Description',
        date_evenement: new Date('2026-04-01'),
        heure_debut: '09:00',
        heure_fin: '11:00',
        lieu: 'New Location',
        image_url: '',
        statut: StatutEvenement.brouillon,
        id_auteur: 1,
        id_formulaire: null
      };

      const createdEvenement = { ...newEvenement, id_evenement: 3 };

      service.createEvenement(newEvenement).subscribe({
        next: (evenement) => {
          expect(evenement).toEqual(createdEvenement);
          expect(evenement.id_evenement).toBe(3);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEvenement);
      req.flush(createdEvenement);
    });

    it('devrait créer un nouvel événement avec FormData', () => {
      const formData = new FormData();
      formData.append('titre', 'New Event');
      formData.append('description', 'New Description');

      const createdEvenement = { ...mockEvenement, id_evenement: 4 };

      service.createEvenement(formData).subscribe({
        next: (evenement) => {
          expect(evenement).toEqual(createdEvenement);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(createdEvenement);
    });

    it('devrait gérer les erreurs de validation lors de la création d\'un événement', () => {
      const invalidEvenement = { ...mockEvenement };

      service.createEvenement(invalidEvenement).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateEvenement', () => {
    it('devrait mettre à jour un événement existant avec un objet Evenement', () => {
      const updatedEvenement: Evenement = {
        ...mockEvenement,
        titre: 'Updated Event'
      };
      const evenementId = 1;

      service.updateEvenement(updatedEvenement, evenementId).subscribe({
        next: (evenement) => {
          expect(evenement).toEqual(updatedEvenement);
          expect(evenement.titre).toBe('Updated Event');
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}?_method=PUT`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(updatedEvenement);
      req.flush(updatedEvenement);
    });

    it('devrait mettre à jour un événement existant avec FormData', () => {
      const formData = new FormData();
      formData.append('titre', 'Updated Event');
      const evenementId = 1;
      const updatedEvenement = { ...mockEvenement, titre: 'Updated Event' };

      service.updateEvenement(formData, evenementId).subscribe({
        next: (evenement) => {
          expect(evenement).toEqual(updatedEvenement);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}?_method=PUT`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(updatedEvenement);
    });

    it('devrait gérer l\'erreur lors de la mise à jour d\'un événement inexistant', () => {
      const evenementId = 999;

      service.updateEvenement(mockEvenement, evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}?_method=PUT`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteEvenement', () => {
    it('devrait supprimer un événement par son id', () => {
      const evenementId = 1;

      service.deleteEvenement(evenementId).subscribe({
        next: () => {
          expect(true).toBe(true);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Deleted successfully' });
    });

    it('devrait gérer l\'erreur lors de la suppression d\'un événement inexistant', () => {
      const evenementId = 999;

      service.deleteEvenement(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('devrait gérer les erreurs serveur lors de la suppression d\'un événement', () => {
      const evenementId = 1;

      service.deleteEvenement(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

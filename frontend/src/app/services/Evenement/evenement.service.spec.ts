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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('getAllEvenements', () => {
    it('should_fetch_all_events', () => {
    // GIVEN

    // WHEN
      service.getAllEvenements().subscribe({
        next: (response) => {

    // THEN
          expect(response.data).toEqual(mockEvenements);
          expect(response.total).toBe(2);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockEvenements, current_page: 1, last_page: 1, total: 2 });
    });

    it('should_return_tableau_empty_when_no_event_n_existe', () => {
    // GIVEN

    // WHEN
      service.getAllEvenements().subscribe({
        next: (response) => {

    // THEN
          expect(response.data).toEqual([]);
          expect(response.total).toBe(0);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], current_page: 1, last_page: 1, total: 0 });
    });

    it('should_handle_errors_when_recuperation_events', () => {
    // GIVEN
      const errorMessage = 'Server error';

    // WHEN
      service.getAllEvenements().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=1`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should_add_filtre_statut_limite_when_fournis', () => {
    // GIVEN

    // WHEN
      service.getAllEvenements('publie', 3, 12).subscribe({
        next: (response) => {

    // THEN
          expect(response.current_page).toBe(3);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=3&statut=publie&limit=12`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockEvenements, current_page: 3, last_page: 4, total: 20 });
    });

    it('should_n_add_pas_filtre_statut_when_value_all', () => {
    // GIVEN

    // WHEN
      service.getAllEvenements('tous', 2).subscribe({
        next: (response) => {

    // THEN
          expect(response.current_page).toBe(2);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements?page=2`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockEvenements, current_page: 2, last_page: 3, total: 10 });
    });
  });

  describe('getEvenementById', () => {
    it('should_fetch_event_specifique_par_id', () => {
    // GIVEN
      const evenementId = 1;

    // WHEN
      service.getEvenementById(evenementId).subscribe({
        next: (evenement) => {

    // THEN
          expect(evenement).toEqual(mockEvenement);
          expect(evenement.id_evenement).toBe(evenementId);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvenement);
    });

    it('should_handle_erreur_404_quand_l_evenement_n_est_pas_trouve', () => {
    // GIVEN
      const evenementId = 999;

    // WHEN
      service.getEvenementById(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createEvenement', () => {
    it('should_create_nouvel_event_objet_event', () => {
    // GIVEN
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

    // WHEN
      service.createEvenement(newEvenement).subscribe({
        next: (evenement) => {

    // THEN
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

    it('should_create_nouvel_event_formdata', () => {
    // GIVEN
      const formData = new FormData();
      formData.append('titre', 'New Event');

      formData.append('description', 'New Description');

      const createdEvenement = { ...mockEvenement, id_evenement: 4 };

    // WHEN
      service.createEvenement(formData).subscribe({
        next: (evenement) => {

    // THEN
          expect(evenement).toEqual(createdEvenement);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(createdEvenement);
    });

    it('should_handle_errors_validation_when_creation_un_evenement', () => {
    // GIVEN
      const invalidEvenement = { ...mockEvenement };

    // WHEN
      service.createEvenement(invalidEvenement).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('getEvenementDetails', () => {
    it('should_fetch_detail_event', () => {
    // GIVEN

    // WHEN
      service.getEvenementDetails(1).subscribe({
        next: (evenement) => {

    // THEN
          expect(evenement).toEqual(mockEvenement);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/1/details`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvenement);
    });
  });

  describe('updateEvenement', () => {
    it('should_update_event_existant_objet_event', () => {
    // GIVEN
      const updatedEvenement: Evenement = {
        ...mockEvenement,
        titre: 'Updated Event'
      };
      const evenementId = 1;

    // WHEN
      service.updateEvenement(updatedEvenement, evenementId).subscribe({
        next: (evenement) => {

    // THEN
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

    it('should_update_event_existant_formdata', () => {
    // GIVEN
      const formData = new FormData();

      formData.append('titre', 'Updated Event');
      const evenementId = 1;
      const updatedEvenement = { ...mockEvenement, titre: 'Updated Event' };

    // WHEN
      service.updateEvenement(formData, evenementId).subscribe({
        next: (evenement) => {

    // THEN
          expect(evenement).toEqual(updatedEvenement);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}?_method=PUT`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(updatedEvenement);
    });

    it('should_handle_erreur_lors_de_la_mise_a_jour_d_un_evenement_inexistant', () => {
    // GIVEN
      const evenementId = 999;

    // WHEN
      service.updateEvenement(mockEvenement, evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}?_method=PUT`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteEvenement', () => {
    it('should_delete_event_par_id', () => {
    // GIVEN
      const evenementId = 1;

    // WHEN
      service.deleteEvenement(evenementId).subscribe({
        next: () => {

    // THEN
          expect(true).toBe(true);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Deleted successfully' });
    });

    it('should_handle_erreur_lors_de_la_suppression_d_un_evenement_inexistant', () => {
    // GIVEN
      const evenementId = 999;

    // WHEN
      service.deleteEvenement(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should_handle_errors_serveur_when_suppression_un_evenement', () => {
    // GIVEN
      const evenementId = 1;

    // WHEN
      service.deleteEvenement(evenementId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${evenementId}`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should_transmettre_password_password_admin_when_suppression', () => {
    // GIVEN

    // WHEN
      service.deleteEvenement(1, 'secret').subscribe({
        next: (response) => {

    // THEN
          expect(response.message).toBe('Deleted successfully');
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ admin_password: 'secret' });
      req.flush({ message: 'Deleted successfully' });
    });
  });
});

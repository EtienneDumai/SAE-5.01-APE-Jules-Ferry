/**
 * Fichier : frontend/src/app/services/Inscription/inscription.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Inscription.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InscriptionService } from './inscription.service';
import { Inscription } from '../../models/Inscription/inscription';
import { environment } from '../../environments/environment';

describe('InscriptionService', () => {
  let service: InscriptionService;
  let httpMock: HttpTestingController;

  const mockInscription: Inscription = {
    id_inscription: 1,
    id_creneau: 1,
    id_utilisateur: 1,
    commentaire: 'Commentaire test',
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T10:00:00Z'
  };

  const mockInscriptions: Inscription[] = [
    mockInscription,
    {
      id_inscription: 2,
      id_creneau: 2,
      id_utilisateur: 1,
      commentaire: null,
      created_at: '2026-01-16T11:00:00Z',
      updated_at: '2026-01-16T11:00:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    
    service = TestBed.inject(InscriptionService);
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

  describe('getAllInscriptions', () => {
    it('should_return_tableau_inscriptions', () => {
    // GIVEN

    // WHEN
      service.getAllInscriptions().subscribe(inscriptions => {

    // THEN
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('should_return_tableau_empty_when_no_inscription', () => {
    // GIVEN

    // WHEN
      service.getAllInscriptions().subscribe(inscriptions => {

    // THEN
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush([]);
    });

    it('should_handle_erreur_quand_getallinscriptions_echoue', () => {
    // GIVEN
      const errorMessage = 'Server error';

    // WHEN
      service.getAllInscriptions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getMesInscriptions', () => {
    it('should_return_mes_inscriptions', () => {
    // GIVEN

    // WHEN
      service.getMesInscriptions().subscribe(inscriptions => {

    // THEN
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('should_return_tableau_empty_when_utilisateur_n_a_pas_d_inscriptions', () => {
    // GIVEN

    // WHEN
      service.getMesInscriptions().subscribe(inscriptions => {

    // THEN
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      req.flush([]);
    });

    it('should_handle_erreur_quand_getmesinscriptions_echoue', () => {
    // GIVEN

    // WHEN
      service.getMesInscriptions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('createInscription', () => {
    it('should_create_nouvelle_inscription_commentaire', () => {
    // GIVEN
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Nouveau commentaire'
      };

    // WHEN
      service.createInscription(inscriptionData).subscribe(inscription => {

    // THEN
        expect(inscription).toEqual(mockInscription);
        expect(inscription.id_creneau).toBe(1);
        expect(inscription.commentaire).toBe('Commentaire test');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(inscriptionData);
      req.flush(mockInscription);
    });

    it('should_create_nouvelle_inscription_sans_commentaire', () => {
    // GIVEN
      const inscriptionData = {
        id_creneau: 2,
        commentaire: null
      };

      const inscriptionWithoutComment = {
        ...mockInscription,
        id_inscription: 3,
        id_creneau: 2,
        commentaire: null
      };

    // WHEN
      service.createInscription(inscriptionData).subscribe(inscription => {

    // THEN
        expect(inscription).toEqual(inscriptionWithoutComment);
        expect(inscription.commentaire).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(inscriptionData);
      req.flush(inscriptionWithoutComment);
    });

    it('should_handle_erreur_quand_le_creneau_est_complet', () => {
    // GIVEN
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Test'
      };

    // WHEN
      service.createInscription(inscriptionData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush('Creneau complet', { status: 409, statusText: 'Conflict' });
    });

    it('should_handle_erreur_quand_deja_inscrit', () => {
    // GIVEN
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Test'
      };

    // WHEN
      service.createInscription(inscriptionData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush('Already registered', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteInscription', () => {
    it('should_delete_inscription_par_id_du_creneau', () => {
    // GIVEN
      const creneauId = 1;

    // WHEN
      service.deleteInscription(creneauId).subscribe(response => {

    // THEN
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should_handle_erreur_quand_l_inscription_n_est_pas_trouvee', () => {
    // GIVEN
      const creneauId = 999;

    // WHEN
      service.deleteInscription(creneauId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should_handle_erreur_quand_non_autorise_a_supprimer', () => {
    // GIVEN
      const creneauId = 1;

    // WHEN
      service.deleteInscription(creneauId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('admin actions', () => {
    it('should_delete_inscription_admin', () => {
    // GIVEN

    // WHEN
      service.deleteInscriptionAdmin(4, 7, 'secret').subscribe(response => {

    // THEN
        expect(response.message).toBe('deleted');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/inscriptions`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({
        id_utilisateur: 4,
        id_creneau: 7,
        password: 'secret'
      });
      req.flush({ message: 'deleted' });
    });

    it('should_create_inscription_admin_sans_commentaire', () => {
    // GIVEN

    // WHEN
      service.createInscriptionAdmin(4, 7, 'secret').subscribe(response => {

    // THEN
        expect(response.message).toBe('created');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        id_utilisateur: 4,
        id_creneau: 7,
        password: 'secret'
      });
      req.flush({ message: 'created' });
    });

    it('should_create_inscription_admin_commentaire', () => {
    // GIVEN

    // WHEN
      service.createInscriptionAdmin(4, 7, 'secret', 'Présent').subscribe(response => {

    // THEN
        expect(response.message).toBe('created');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        id_utilisateur: 4,
        id_creneau: 7,
        password: 'secret',
        commentaire: 'Présent'
      });
      req.flush({ message: 'created' });
    });

    it('should_modifier_inscription_admin', () => {
    // GIVEN

    // WHEN
      service.updateInscriptionAdmin(4, 7, 8, 'secret').subscribe(response => {

    // THEN
        expect(response.message).toBe('updated');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/inscriptions`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        id_utilisateur: 4,
        old_id_creneau: 7,
        new_id_creneau: 8,
        password: 'secret'
      });
      req.flush({ message: 'updated' });
    });
  });
});

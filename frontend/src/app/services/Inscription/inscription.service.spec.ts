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

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllInscriptions', () => {
    it('devrait retourner un tableau d\'inscriptions', () => {
      service.getAllInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('devrait retourner un tableau vide quand aucune inscription', () => {
      service.getAllInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush([]);
    });

    it('devrait gérer l\'erreur quand getAllInscriptions échoue', () => {
      const errorMessage = 'Server error';

      service.getAllInscriptions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getMesInscriptions', () => {
    it('devrait retourner mes inscriptions', () => {
      service.getMesInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('devrait retourner un tableau vide quand l\'utilisateur n\'a pas d\'inscriptions', () => {
      service.getMesInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      req.flush([]);
    });

    it('devrait gérer l\'erreur quand getMesInscriptions échoue', () => {
      service.getMesInscriptions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('createInscription', () => {
    it('devrait créer une nouvelle inscription avec commentaire', () => {
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Nouveau commentaire'
      };

      service.createInscription(inscriptionData).subscribe(inscription => {
        expect(inscription).toEqual(mockInscription);
        expect(inscription.id_creneau).toBe(1);
        expect(inscription.commentaire).toBe('Commentaire test');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(inscriptionData);
      req.flush(mockInscription);
    });

    it('devrait créer une nouvelle inscription sans commentaire', () => {
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

      service.createInscription(inscriptionData).subscribe(inscription => {
        expect(inscription).toEqual(inscriptionWithoutComment);
        expect(inscription.commentaire).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(inscriptionData);
      req.flush(inscriptionWithoutComment);
    });

    it('devrait gérer l\'erreur quand le créneau est complet', () => {
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Test'
      };

      service.createInscription(inscriptionData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush('Creneau complet', { status: 409, statusText: 'Conflict' });
    });

    it('devrait gérer l\'erreur quand déjà inscrit', () => {
      const inscriptionData = {
        id_creneau: 1,
        commentaire: 'Test'
      };

      service.createInscription(inscriptionData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush('Already registered', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteInscription', () => {
    it('devrait supprimer une inscription par l\'id du créneau', () => {
      const creneauId = 1;

      service.deleteInscription(creneauId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('devrait gérer l\'erreur quand l\'inscription n\'est pas trouvée', () => {
      const creneauId = 999;

      service.deleteInscription(creneauId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('devrait gérer l\'erreur quand non autorisé à supprimer', () => {
      const creneauId = 1;

      service.deleteInscription(creneauId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});

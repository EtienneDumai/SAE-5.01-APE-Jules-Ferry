import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InscriptionService } from './inscription.service';
import { Inscription } from '../../models/Inscription/inscription';
import { environment } from '../../environments/environment.dev';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllInscriptions', () => {
    it('should return an array of inscriptions', () => {
      service.getAllInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('should return empty array when no inscriptions', () => {
      service.getAllInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions`);
      req.flush([]);
    });

    it('should handle error when getAllInscriptions fails', () => {
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
    it('should return my inscriptions', () => {
      service.getMesInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual(mockInscriptions);
        expect(inscriptions.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInscriptions);
    });

    it('should return empty array when user has no inscriptions', () => {
      service.getMesInscriptions().subscribe(inscriptions => {
        expect(inscriptions).toEqual([]);
        expect(inscriptions.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/mes-inscriptions`);
      req.flush([]);
    });

    it('should handle error when getMesInscriptions fails', () => {
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
    it('should create a new inscription with commentaire', () => {
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

    it('should create a new inscription without commentaire', () => {
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

    it('should handle error when creneau is full', () => {
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

    it('should handle error when already registered', () => {
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
    it('should delete an inscription by creneau id', () => {
      const creneauId = 1;

      service.deleteInscription(creneauId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/inscriptions/${creneauId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when inscription not found', () => {
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

    it('should handle error when unauthorized to delete', () => {
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

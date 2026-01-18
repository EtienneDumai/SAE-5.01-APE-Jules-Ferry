import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreneauService } from './creneau.service';
import { Creneau } from '../../models/Creneau/creneau';
import { environment } from '../../environments/environment.dev';

describe('CreneauService', () => {
  let service: CreneauService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockCreneau: Creneau = {
    id_creneau: 1,
    heure_debut: '09:00',
    heure_fin: '12:00',
    quota: 10,
    id_tache: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    inscriptions_count: 5,
    est_inscrit: false,
    selected: false
  };

  const mockCreneaux: Creneau[] = [
    mockCreneau,
    {
      id_creneau: 2,
      heure_debut: '14:00',
      heure_fin: '17:00',
      quota: 15,
      id_tache: 1,
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      inscriptions_count: 8,
      est_inscrit: true,
      selected: false
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(CreneauService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCreneaux', () => {
    it('should retrieve all creneaux', () => {
      service.getAllCreneaux().subscribe({
        next: (creneaux) => {
          expect(creneaux).toEqual(mockCreneaux);
          expect(creneaux.length).toBe(2);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreneaux);
    });

    it('should return empty array when no creneaux exist', () => {
      service.getAllCreneaux().subscribe({
        next: (creneaux) => {
          expect(creneaux).toEqual([]);
          expect(creneaux.length).toBe(0);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle error when retrieving creneaux', () => {
      const errorMessage = 'Server error';
      
      service.getAllCreneaux().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getCreneauById', () => {
    it('should retrieve a specific creneau by id', () => {
      const creneauId = 1;

      service.getCreneauById(creneauId).subscribe({
        next: (creneau) => {
          expect(creneau).toEqual(mockCreneau);
          expect(creneau.id_creneau).toBe(creneauId);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreneau);
    });

    it('should handle 404 when creneau not found', () => {
      const creneauId = 999;

      service.getCreneauById(creneauId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCreneau', () => {
    it('should create a new creneau', () => {
      const newCreneau: Creneau = {
        id_creneau: 0,
        heure_debut: '08:00',
        heure_fin: '10:00',
        quota: 20,
        id_tache: 2,
        est_inscrit: false,
        selected: false
      };

      const createdCreneau = { ...newCreneau, id_creneau: 3 };

      service.createCreneau(newCreneau).subscribe({
        next: (creneau) => {
          expect(creneau).toEqual(createdCreneau);
          expect(creneau.id_creneau).toBe(3);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCreneau);
      req.flush(createdCreneau);
    });

    it('should handle validation error when creating creneau', () => {
      const invalidCreneau: Creneau = {
        id_creneau: 0,
        heure_debut: '',
        heure_fin: '',
        quota: -1,
        id_tache: 0,
        est_inscrit: false,
        selected: false
      };

      service.createCreneau(invalidCreneau).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateCreneau', () => {
    it('should update an existing creneau', () => {
      const updatedCreneau: Creneau = {
        ...mockCreneau,
        quota: 25
      };
      const creneauId = 1;

      service.updateCreneau(updatedCreneau, creneauId).subscribe({
        next: (creneau) => {
          expect(creneau).toEqual(updatedCreneau);
          expect(creneau.quota).toBe(25);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedCreneau);
      req.flush(updatedCreneau);
    });

    it('should handle error when updating non-existent creneau', () => {
      const creneauId = 999;

      service.updateCreneau(mockCreneau, creneauId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle validation error when updating creneau', () => {
      const creneauId = 1;
      const invalidCreneau = { ...mockCreneau, quota: -1 };

      service.updateCreneau(invalidCreneau, creneauId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('deleteCreneau', () => {
    it('should delete a creneau by id', () => {
      const creneauId = 1;

      service.deleteCreneau(creneauId).subscribe({
        next: () => {
          expect(true).toBe(true);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent creneau', () => {
      const creneauId = 999;

      service.deleteCreneau(creneauId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error when deleting creneau', () => {
      const creneauId = 1;

      service.deleteCreneau(creneauId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/creneaux/${creneauId}`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getCreneauxByEventId', () => {
    it('should retrieve creneaux for a specific event', () => {
      const eventId = 1;

      service.getCreneauxByEventId(eventId).subscribe({
        next: (creneaux) => {
          expect(creneaux).toEqual(mockCreneaux);
          expect(creneaux.length).toBe(2);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${eventId}/creneaux`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCreneaux);
    });

    it('should return empty array when event has no creneaux', () => {
      const eventId = 2;

      service.getCreneauxByEventId(eventId).subscribe({
        next: (creneaux) => {
          expect(creneaux).toEqual([]);
          expect(creneaux.length).toBe(0);
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${eventId}/creneaux`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle error when event not found', () => {
      const eventId = 999;

      service.getCreneauxByEventId(eventId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${eventId}/creneaux`);
      req.flush('Event Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error when retrieving creneaux by event', () => {
      const eventId = 1;

      service.getCreneauxByEventId(eventId).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/evenements/${eventId}/creneaux`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

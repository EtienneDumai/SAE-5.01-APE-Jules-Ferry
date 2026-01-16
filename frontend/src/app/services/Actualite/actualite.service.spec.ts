import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActualiteService } from './actualite.service';
import { Actualite } from '../../models/Actualite/actualite';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { environment } from '../../environments/environment.dev';

describe('ActualiteService', () => {
  let service: ActualiteService;
  let httpMock: HttpTestingController;

  const mockActualite: Actualite = {
    id_actualite: 1,
    titre: 'Actualité Test',
    contenu: 'Contenu de test',
    image_url: 'test.jpg',
    date_publication: new Date('2026-01-15'),
    statut: StatutActualite.publie,
  } as unknown as Actualite;

  const mockActualites: Actualite[] = [
    mockActualite,
    {
      id_actualite: 2,
      titre: 'Actualité 2',
      contenu: 'Contenu 2',
      image_url: 'test2.jpg',
      date_publication: new Date('2026-01-16'),
      statut: StatutActualite.brouillon,
    } as unknown as Actualite,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(ActualiteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllActualites', () => {
    it('should return an array of actualites', () => {
      service.getAllActualites().subscribe((actualites) => {
        expect(actualites).toEqual(mockActualites);
        expect(actualites.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActualites);
    });

    it('should handle empty array response', () => {
      service.getAllActualites().subscribe((actualites) => {
        expect(actualites).toEqual([]);
        expect(actualites.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush([]);
    });

    it('should handle error response', () => {
      const errorMessage = 'Server error';
      
      service.getAllActualites().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getActualiteById', () => {
    it('should return a single actualite by id', () => {
      service.getActualiteById(1).subscribe((actualite) => {
        expect(actualite).toEqual(mockActualite);
        expect(actualite.id_actualite).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActualite);
    });

    it('should handle not found error', () => {
      service.getActualiteById(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createActualite', () => {
    it('should create a new actualite', () => {
      const newActualite: Actualite = {
        titre: 'Nouvelle Actualité',
        contenu: 'Nouveau contenu',
        image_url: 'new.jpg',
        date_publication: new Date('2026-01 -17'),
        statut: StatutActualite.brouillon,
      } as Actualite;

      service.createActualite(newActualite).subscribe((actualite) => {
        expect(actualite).toEqual({ ...newActualite, id_actualite: 3 });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newActualite);
      req.flush({ ...newActualite, id_actualite: 3 });
    });

    it('should handle validation error', () => {
      const invalidActualite: Actualite = {} as Actualite;

      service.createActualite(invalidActualite).subscribe({
        next: () => fail('should have failed with 422 error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush('Validation error', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateActualite', () => {
    it('should update an existing actualite', () => {
      const updatedActualite: Actualite = {
        ...mockActualite,
        titre: 'Titre mis à jour',
      };

      service.updateActualite(updatedActualite, 1).subscribe((actualite) => {
        expect(actualite).toEqual(updatedActualite);
        expect(actualite.titre).toBe('Titre mis à jour');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedActualite);
      req.flush(updatedActualite);
    });

    it('should handle not found error on update', () => {
      service.updateActualite(mockActualite, 999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteActualite', () => {
    it('should delete an actualite', () => {
      service.deleteActualite(1).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle not found error on delete', () => {
      service.deleteActualite(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

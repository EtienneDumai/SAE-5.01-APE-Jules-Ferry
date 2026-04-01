/**
 * Fichier : frontend/src/app/services/Actualite/actualite.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Actualite.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActualiteService } from './actualite.service';
import { Actualite } from '../../models/Actualite/actualite';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { environment } from '../../environments/environment';

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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('getAllActualites', () => {
    it('should_return_tableau_actualites', () => {
    // GIVEN

    // WHEN
      service.getAllActualites().subscribe((actualites) => {

    // THEN
        expect(actualites).toEqual(mockActualites);
        expect(actualites.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActualites);
    });

    it('should_handle_reponse_tableau_empty', () => {
    // GIVEN

    // WHEN
      service.getAllActualites().subscribe((actualites) => {

    // THEN
        expect(actualites).toEqual([]);
        expect(actualites.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush([]);
    });

    it('should_handle_reponse_erreur', () => {
    // GIVEN
      const errorMessage = 'Server error';

    // WHEN
      service.getAllActualites().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getActualiteById', () => {
    it('should_return_actualite_unique_par_id', () => {
    // GIVEN

    // WHEN
      service.getActualiteById(1).subscribe((actualite) => {

    // THEN
        expect(actualite).toEqual(mockActualite);
        expect(actualite.id_actualite).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActualite);
    });

    it('should_handle_erreur_non_trouve', () => {
    // GIVEN

    // WHEN
      service.getActualiteById(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createActualite', () => {
    it('should_create_nouvelle_actualite', () => {
    // GIVEN
      const newActualite: Actualite = {
        titre: 'Nouvelle Actualité',
        contenu: 'Nouveau contenu',
        image_url: 'new.jpg',
        date_publication: new Date('2026-01 -17'),
        statut: StatutActualite.brouillon,
      } as Actualite;

    // WHEN
      service.createActualite(newActualite).subscribe((actualite) => {

    // THEN
        expect(actualite).toEqual({ ...newActualite, id_actualite: 3 });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newActualite);
      req.flush({ ...newActualite, id_actualite: 3 });
    });

    it('should_create_actualite_formdata', () => {
    // GIVEN
      const formData = new FormData();
      formData.append('titre', 'Nouvelle Actualité');
      formData.append('contenu', 'Nouveau contenu');
      formData.append('date_publication', '2026-01-17');

      formData.append('statut', 'BROUILLON');

      const expectedResponse: Actualite = {
        id_actualite: 3,
        titre: 'Nouvelle Actualité',
        contenu: 'Nouveau contenu',
        image_url: 'new.jpg',
        date_publication: new Date('2026-01-17'),
        statut: StatutActualite.brouillon,
      } as Actualite;

    // WHEN
      service.createActualite(formData).subscribe((actualite) => {

    // THEN
        expect(actualite).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      req.flush(expectedResponse);
    });

    it('should_handle_errors_validation', () => {
    // GIVEN
      const invalidActualite: Actualite = {} as Actualite;

    // WHEN
      service.createActualite(invalidActualite).subscribe({
        next: () => fail('should have failed with 422 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites`);
      req.flush('Validation error', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateActualite', () => {
    it('should_update_actualite_existante', () => {
    // GIVEN
      const updatedActualite: Actualite = {
        ...mockActualite,
        titre: 'Titre mis à jour',
      };

    // WHEN
      service.updateActualite(updatedActualite, 1).subscribe((actualite) => {

    // THEN
        expect(actualite).toEqual(updatedActualite);
        expect(actualite.titre).toBe('Titre mis à jour');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedActualite);
      req.flush(updatedActualite);
    });

    it('should_handle_erreur_non_trouve_lors_de_la_mise_a_jour', () => {
    // GIVEN

    // WHEN
      service.updateActualite(mockActualite, 999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteActualite', () => {
    it('should_delete_actualite', () => {
    // GIVEN

    // WHEN
      service.deleteActualite(1).subscribe(() => {

    // THEN
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should_handle_erreur_non_trouve_lors_de_la_suppression', () => {
    // GIVEN

    // WHEN
      service.deleteActualite(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/actualites/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

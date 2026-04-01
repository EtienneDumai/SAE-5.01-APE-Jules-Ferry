/**
 * Fichier : frontend/src/app/services/Utilisateur/utilisateur.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Utilisateur.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UtilisateurService } from './utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { environment } from '../../environments/environment';

describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let httpMock: HttpTestingController;

  const mockUtilisateur: Utilisateur = {
    id_utilisateur: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    role: RoleUtilisateur.parent,
  } as Utilisateur;

  const mockUtilisateurs: Utilisateur[] = [
    mockUtilisateur,
    {
      id_utilisateur: 2,
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@example.com',
      role: RoleUtilisateur.administrateur,
    } as Utilisateur,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UtilisateurService);
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

  describe('utilisateurCourant management', () => {
    it('should_avoir_observable_utilisateurcourant_defini', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(service.utilisateurCourant).toBeDefined();
    });

    it('should_initialement_avoir_user_null', (done) => {
    // GIVEN

    // WHEN
      service.utilisateurCourant.subscribe((utilisateur) => {

    // THEN
        expect(utilisateur).toBeNull();
        done();
      });
    });

    it('should_return_null_getutilisateurcourant_initialement', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(service.getUtilisateurCourant()).toBeNull();
    });
  });

  describe('setUtilisateurCourant', () => {
    it('should_definir_utilisateur_actuel', (done) => {
    // GIVEN

    // WHEN
      service.setUtilisateurCourant(mockUtilisateur);

      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur) {

    // THEN
          expect(utilisateur).toEqual(mockUtilisateur);
          done();
        }
      });
    });

    it('should_update_value_retour_getutilisateurcourant', () => {
    // GIVEN

    // WHEN
      service.setUtilisateurCourant(mockUtilisateur);

    // THEN
      expect(service.getUtilisateurCourant()).toEqual(mockUtilisateur);
    });

    it('should_definir_utilisateur_a_null', (done) => {
    // GIVEN

    // WHEN
      service.setUtilisateurCourant(mockUtilisateur);

      service.setUtilisateurCourant(null);

      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur === null) {

    // THEN
          expect(utilisateur).toBeNull();
          done();
        }
      });
    });

    it('should_notifier_abonnes_when_utilisateur_change', () => {
    // GIVEN
      const values: (Utilisateur | null)[] = [];

    // WHEN
      service.utilisateurCourant.subscribe((utilisateur) => {
        values.push(utilisateur);
      });

      service.setUtilisateurCourant(mockUtilisateur);

      service.setUtilisateurCourant(null);

    // THEN
      expect(values.length).toBe(3); // initial null + 2 changes
      expect(values[0]).toBeNull();
      expect(values[1]).toEqual(mockUtilisateur);
      expect(values[2]).toBeNull();
    });
  });

  describe('getAllUtilisateurs', () => {
    it('should_return_tableau_utilisateurs', () => {
    // GIVEN

    // WHEN
      service.getAllUtilisateurs().subscribe((utilisateurs) => {

    // THEN
        expect(utilisateurs).toEqual(mockUtilisateurs);
        expect(utilisateurs.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateurs);
    });

    it('should_handle_reponse_tableau_empty', () => {
    // GIVEN

    // WHEN
      service.getAllUtilisateurs().subscribe((utilisateurs) => {

    // THEN
        expect(utilisateurs).toEqual([]);
        expect(utilisateurs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush([]);
    });

    it('should_handle_reponse_erreur', () => {
    // GIVEN

    // WHEN
      service.getAllUtilisateurs().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUtilisateurById', () => {
    it('should_return_user_unique_par_id', () => {
    // GIVEN

    // WHEN
      service.getUtilisateurById(1).subscribe((utilisateur) => {

    // THEN
        expect(utilisateur).toEqual(mockUtilisateur);
        expect(utilisateur.id_utilisateur).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateur);
    });

    it('should_handle_erreur_non_trouve', () => {
    // GIVEN

    // WHEN
      service.getUtilisateurById(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUtilisateur', () => {
    it('should_create_nouvel_user', () => {
    // GIVEN
      const newUtilisateur: Utilisateur = {
        nom: 'Nouveau',
        prenom: 'Test',
        email: 'test.nouveau@example.com',
        role: RoleUtilisateur.parent,
      } as Utilisateur;

    // WHEN
      service.createUtilisateur(newUtilisateur).subscribe((utilisateur) => {

    // THEN
        expect(utilisateur).toEqual({ ...newUtilisateur, id_utilisateur: 3 });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...newUtilisateur, admin_password: undefined });
      req.flush({ ...newUtilisateur, id_utilisateur: 3 });
    });

    it('should_handle_errors_validation', () => {
    // GIVEN
      const invalidUtilisateur: Utilisateur = {} as Utilisateur;

    // WHEN
      service.createUtilisateur(invalidUtilisateur).subscribe({
        next: () => fail('should have failed with 422 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush('Validation error', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateUtilisateur', () => {
    it('should_update_user_existant', () => {
    // GIVEN
      const updatedUtilisateur: Utilisateur = {
        ...mockUtilisateur,
        nom: 'Dupont Modifié',
      };

    // WHEN
      service.updateUtilisateur(updatedUtilisateur, 1).subscribe((utilisateur) => {

    // THEN
        expect(utilisateur).toEqual(updatedUtilisateur);
        expect(utilisateur.nom).toBe('Dupont Modifié');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ ...updatedUtilisateur, admin_password: undefined });
      req.flush(updatedUtilisateur);
    });

    it('should_handle_erreur_non_trouve_lors_de_la_mise_a_jour', () => {
    // GIVEN

    // WHEN
      service.updateUtilisateur(mockUtilisateur, 999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteUtilisateur', () => {
    it('should_delete_user_return_message', () => {
    // GIVEN
      const expectedResponse = { message: 'Utilisateur supprimé avec succès' };

    // WHEN
      service.deleteUtilisateur(1).subscribe((response) => {

    // THEN
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should_handle_erreur_non_trouve_lors_de_la_suppression', () => {
    // GIVEN

    // WHEN
      service.deleteUtilisateur(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

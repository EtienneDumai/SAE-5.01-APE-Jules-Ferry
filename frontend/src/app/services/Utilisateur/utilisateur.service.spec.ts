import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UtilisateurService } from './utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { environment } from '../../environments/environment.dev';

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

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('utilisateurCourant management', () => {
    it('devrait avoir l\'observable utilisateurCourant défini', () => {
      expect(service.utilisateurCourant).toBeDefined();
    });

    it('devrait initialement avoir un utilisateur null', (done) => {
      service.utilisateurCourant.subscribe((utilisateur) => {
        expect(utilisateur).toBeNull();
        done();
      });
    });

    it('devrait retourner null depuis getUtilisateurCourant initialement', () => {
      expect(service.getUtilisateurCourant()).toBeNull();
    });
  });

  describe('setUtilisateurCourant', () => {
    it('devrait définir l\'utilisateur actuel', (done) => {
      service.setUtilisateurCourant(mockUtilisateur);

      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur) {
          expect(utilisateur).toEqual(mockUtilisateur);
          done();
        }
      });
    });

    it('devrait mettre à jour la valeur de retour de getUtilisateurCourant', () => {
      service.setUtilisateurCourant(mockUtilisateur);
      expect(service.getUtilisateurCourant()).toEqual(mockUtilisateur);
    });

    it('devrait définir l\'utilisateur à null', (done) => {
      service.setUtilisateurCourant(mockUtilisateur);
      service.setUtilisateurCourant(null);

      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur === null) {
          expect(utilisateur).toBeNull();
          done();
        }
      });
    });

    it('devrait notifier les abonnés quand l\'utilisateur change', () => {
      const values: (Utilisateur | null)[] = [];

      service.utilisateurCourant.subscribe((utilisateur) => {
        values.push(utilisateur);
      });

      service.setUtilisateurCourant(mockUtilisateur);
      service.setUtilisateurCourant(null);

      expect(values.length).toBe(3); // initial null + 2 changes
      expect(values[0]).toBeNull();
      expect(values[1]).toEqual(mockUtilisateur);
      expect(values[2]).toBeNull();
    });
  });

  describe('getAllUtilisateurs', () => {
    it('devrait retourner un tableau d\'utilisateurs', () => {
      service.getAllUtilisateurs().subscribe((utilisateurs) => {
        expect(utilisateurs).toEqual(mockUtilisateurs);
        expect(utilisateurs.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateurs);
    });

    it('devrait gérer une réponse avec un tableau vide', () => {
      service.getAllUtilisateurs().subscribe((utilisateurs) => {
        expect(utilisateurs).toEqual([]);
        expect(utilisateurs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush([]);
    });

    it('devrait gérer une réponse d\'erreur', () => {
      service.getAllUtilisateurs().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUtilisateurById', () => {
    it('devrait retourner un utilisateur unique par son id', () => {
      service.getUtilisateurById(1).subscribe((utilisateur) => {
        expect(utilisateur).toEqual(mockUtilisateur);
        expect(utilisateur.id_utilisateur).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateur);
    });

    it('devrait gérer l\'erreur non trouvé', () => {
      service.getUtilisateurById(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUtilisateur', () => {
    it('devrait créer un nouvel utilisateur', () => {
      const newUtilisateur: Utilisateur = {
        nom: 'Nouveau',
        prenom: 'Test',
        email: 'test.nouveau@example.com',
        role: RoleUtilisateur.parent,
      } as Utilisateur;

      service.createUtilisateur(newUtilisateur).subscribe((utilisateur) => {
        expect(utilisateur).toEqual({ ...newUtilisateur, id_utilisateur: 3 });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...newUtilisateur, admin_password: undefined });
      req.flush({ ...newUtilisateur, id_utilisateur: 3 });
    });

    it('devrait gérer les erreurs de validation', () => {
      const invalidUtilisateur: Utilisateur = {} as Utilisateur;

      service.createUtilisateur(invalidUtilisateur).subscribe({
        next: () => fail('should have failed with 422 error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush('Validation error', { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('updateUtilisateur', () => {
    it('devrait mettre à jour un utilisateur existant', () => {
      const updatedUtilisateur: Utilisateur = {
        ...mockUtilisateur,
        nom: 'Dupont Modifié',
      };

      service.updateUtilisateur(updatedUtilisateur, 1).subscribe((utilisateur) => {
        expect(utilisateur).toEqual(updatedUtilisateur);
        expect(utilisateur.nom).toBe('Dupont Modifié');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ ...updatedUtilisateur, admin_password: undefined });
      req.flush(updatedUtilisateur);
    });

    it('devrait gérer l\'erreur non trouvé lors de la mise à jour', () => {
      service.updateUtilisateur(mockUtilisateur, 999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteUtilisateur', () => {
    it('devrait supprimer un utilisateur et retourner un message', () => {
      const expectedResponse = { message: 'Utilisateur supprimé avec succès' };

      service.deleteUtilisateur(1).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('devrait gérer l\'erreur non trouvé lors de la suppression', () => {
      service.deleteUtilisateur(999).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('utilisateurCourant management', () => {
    it('should have utilisateurCourant observable defined', () => {
      expect(service.utilisateurCourant).toBeDefined();
    });

    it('should initially have null utilisateur', (done) => {
      service.utilisateurCourant.subscribe((utilisateur) => {
        expect(utilisateur).toBeNull();
        done();
      });
    });

    it('should return null from getUtilisateurCourant initially', () => {
      expect(service.getUtilisateurCourant()).toBeNull();
    });
  });

  describe('setUtilisateurCourant', () => {
    it('should set current utilisateur', (done) => {
      service.setUtilisateurCourant(mockUtilisateur);
      
      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur) {
          expect(utilisateur).toEqual(mockUtilisateur);
          done();
        }
      });
    });

    it('should update getUtilisateurCourant return value', () => {
      service.setUtilisateurCourant(mockUtilisateur);
      expect(service.getUtilisateurCourant()).toEqual(mockUtilisateur);
    });

    it('should set utilisateur to null', (done) => {
      service.setUtilisateurCourant(mockUtilisateur);
      service.setUtilisateurCourant(null);
      
      service.utilisateurCourant.subscribe((utilisateur) => {
        if (utilisateur === null) {
          expect(utilisateur).toBeNull();
          done();
        }
      });
    });

    it('should notify subscribers when utilisateur changes', () => {
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
    it('should return an array of utilisateurs', () => {
      service.getAllUtilisateurs().subscribe((utilisateurs) => {
        expect(utilisateurs).toEqual(mockUtilisateurs);
        expect(utilisateurs.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateurs);
    });

    it('should handle empty array response', () => {
      service.getAllUtilisateurs().subscribe((utilisateurs) => {
        expect(utilisateurs).toEqual([]);
        expect(utilisateurs.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush([]);
    });

    it('should handle error response', () => {
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
    it('should return a single utilisateur by id', () => {
      service.getUtilisateurById(1).subscribe((utilisateur) => {
        expect(utilisateur).toEqual(mockUtilisateur);
        expect(utilisateur.id_utilisateur).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateur);
    });

    it('should handle not found error', () => {
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
    it('should create a new utilisateur', () => {
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
      expect(req.request.body).toEqual(newUtilisateur);
      req.flush({ ...newUtilisateur, id_utilisateur: 3 });
    });

    it('should handle validation error', () => {
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
    it('should update an existing utilisateur', () => {
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
      expect(req.request.body).toEqual(updatedUtilisateur);
      req.flush(updatedUtilisateur);
    });

    it('should handle not found error on update', () => {
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
    it('should delete an utilisateur and return message', () => {
      const expectedResponse = { message: 'Utilisateur supprimé avec succès' };

      service.deleteUtilisateur(1).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });

    it('should handle not found error on delete', () => {
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

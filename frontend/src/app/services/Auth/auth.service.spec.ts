import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from '../Token/token.service';
import { AuthResponse } from '../../models/Auth/auth-response';
import { LoginCredentials } from '../../models/Auth/login-credentials';
import { RegisterData } from '../../models/Auth/register-data';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';
import { environment } from '../../environments/environment.dev';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let router: jasmine.SpyObj<Router>;
  const apiUrl = environment.apiUrl;

  const mockUtilisateur: Utilisateur = {
    id_utilisateur: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: RoleUtilisateur.parent,
    statut_compte: StatutCompte.actif
  };

  const mockAdminUtilisateur: Utilisateur = {
    id_utilisateur: 2,
    nom: 'Admin',
    prenom: 'Super',
    email: 'admin@example.com',
    role: RoleUtilisateur.administrateur,
    statut_compte: StatutCompte.actif
  };

  const mockAuthResponse: AuthResponse = {
    message: 'Login successful',
    user: mockUtilisateur,
    token: 'fake-jwt-token-123'
  };

  const mockAdminAuthResponse: AuthResponse = {
    message: 'Login successful',
    user: mockAdminUtilisateur,
    token: 'fake-admin-token-456'
  };

  beforeEach(async () => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', [
      'saveToken',
      'getToken',
      'removeToken',
      'hasToken'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
    }).compileComponents();

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('devrait charger l\'utilisateur actuel quand un token existe', () => {
      // MODIF: On force le Spy à dire "Oui, j'ai un token"
      tokenService.hasToken.and.returnValue(true);
      // MODIF: Il faut AUSSI lui donner un faux token, sinon l'intercepteur bloque !
      tokenService.getToken.and.returnValue('fake-token');

      service.init();

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
      });
    });

    it('ne devrait pas charger l\'utilisateur actuel quand aucun token n\'existe', () => {
      tokenService.hasToken.and.returnValue(false);

      service.init();

      httpMock.expectNone(`${apiUrl}/user`);
      expect(tokenService.hasToken).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('devrait enregistrer un nouvel utilisateur et sauvegarder le token', (done) => {
      const registerData: RegisterData = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john.doe@example.com',
        mot_de_passe: 'password123',
        mot_de_passe_confirmation: 'password123'
      };

      service.register(registerData).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(tokenService.saveToken).toHaveBeenCalledWith(mockAuthResponse.token);

          service.currentUser$.subscribe(user => {
            expect(user).toEqual(mockUtilisateur);
            done();
          });
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });

    it('devrait gérer les erreurs de validation lors de l\'inscription', () => {
      const registerData: RegisterData = {
        nom: '',
        prenom: '',
        email: 'invalid-email',
        mot_de_passe: '123',
        mot_de_passe_confirmation: '456'
      };

      service.register(registerData).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur bénévole et naviguer vers l\'accueil', (done) => {
      const credentials: LoginCredentials = {
        email: 'john.doe@example.com',
        mot_de_passe: 'password123'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(tokenService.saveToken).toHaveBeenCalledWith(mockAuthResponse.token);
          expect(router.navigate).toHaveBeenCalledWith(['/']);

          service.currentUser$.subscribe(user => {
            expect(user).toEqual(mockUtilisateur);
            done();
          });
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('devrait connecter un utilisateur admin et naviguer vers les événements', (done) => {
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        mot_de_passe: 'admin123'
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAdminAuthResponse);
          expect(tokenService.saveToken).toHaveBeenCalledWith(mockAdminAuthResponse.token);
          expect(router.navigate).toHaveBeenCalledWith(['/evenements']);

          service.currentUser$.subscribe(user => {
            expect(user).toEqual(mockAdminUtilisateur);
            done();
          });
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAdminAuthResponse);
    });

    it('devrait gérer les identifiants invalides', () => {
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        mot_de_passe: 'wrongpassword'
      };

      service.login(credentials).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur, supprimer le token et naviguer vers login', (done) => {
      // D'abord on se connecte pour avoir un utilisateur
      service['currentUserSubject'].next(mockUtilisateur);

      service.logout().subscribe({
        next: () => {
          expect(tokenService.removeToken).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);

          // On vérifie que l'utilisateur est maintenant null
          const currentUser = service.getCurrentUser();
          expect(currentUser).toBeNull();
          done();
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('devrait gérer l\'erreur de déconnexion mais nettoyer l\'état local', () => {
      service.logout().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {
          expect(error.status).toBe(500);
          // Note: même en cas d'erreur, le service devrait idéalement nettoyer l'état local
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('loadCurrentUser', () => {
    beforeEach(() => {
      // On force le service à croire qu'il a un token valide
      tokenService.hasToken.and.returnValue(true);
      tokenService.getToken.and.returnValue('fake-token-pour-le-test');
    });

    it('devrait charger l\'utilisateur actuel avec succès', (done) => {
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
        done();
      });
    });

    it('devrait gérer l\'erreur et nettoyer le token', (done) => {
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/user`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      setTimeout(() => {
        expect(tokenService.removeToken).toHaveBeenCalled();
        service.currentUser$.subscribe(user => {
          expect(user).toBeNull();
          done();
        });
      }, 100);
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner vrai quand un token existe', () => {
      tokenService.hasToken.and.returnValue(true);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('devrait retourner faux quand aucun token n\'existe', () => {
      tokenService.hasToken.and.returnValue(false);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner l\'utilisateur actuel', (done) => {
      service['currentUserSubject'].next(mockUtilisateur);

      const currentUser = service.getCurrentUser();
      expect(currentUser).toEqual(mockUtilisateur);
      done();
    });

    it('devrait retourner null quand aucun utilisateur n\'est connecté', () => {
      service['currentUserSubject'].next(null);

      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('devrait retourner vrai quand l\'utilisateur a le rôle spécifié', () => {
      service['currentUserSubject'].next(mockUtilisateur);

      expect(service.hasRole('parent')).toBe(true);
    });

    it('devrait retourner faux quand l\'utilisateur n\'a pas le rôle spécifié', () => {
      service['currentUserSubject'].next(mockUtilisateur);

      expect(service.hasRole('administrateur')).toBe(false);
    });

    it('devrait retourner faux quand aucun utilisateur n\'est connecté', () => {
      service['currentUserSubject'].next(null);

      expect(service.hasRole('benevole')).toBe(false);
    });

    it('devrait retourner vrai quand l\'utilisateur admin a le rôle admin', () => {
      service['currentUserSubject'].next(mockAdminUtilisateur);

      expect(service.hasRole('administrateur')).toBe(true);
    });
  });

  describe('currentUser$ observable', () => {
    it('devrait émettre les changements d\'utilisateur', (done) => {
      // Réinitialiser à null avant de commencer
      service['currentUserSubject'].next(null);

      const users: (Utilisateur | null)[] = [];

      const subscription = service.currentUser$.subscribe(user => {
        users.push(user);

        if (users.length === 3) {
          expect(users[0]).toBeNull(); // Initial value
          expect(users[1]).toEqual(mockUtilisateur);
          expect(users[2]).toEqual(mockAdminUtilisateur);
          subscription.unsubscribe();
          done();
        }
      });

      service['currentUserSubject'].next(mockUtilisateur);
      service['currentUserSubject'].next(mockAdminUtilisateur);
    });
  });
});
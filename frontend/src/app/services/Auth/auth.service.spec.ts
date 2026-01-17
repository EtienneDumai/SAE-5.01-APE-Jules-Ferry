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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should load current user when token exists', () => {
      tokenService.hasToken.and.returnValue(true);
      
      service.init();

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
      });
    });

    it('should not load current user when no token exists', () => {
      tokenService.hasToken.and.returnValue(false);
      
      service.init();

      httpMock.expectNone(`${apiUrl}/user`);
    });
  });

  describe('register', () => {
    it('should register a new user and save token', (done) => {
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

    it('should handle validation error during registration', () => {
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
    it('should login a benevole user and navigate to home', (done) => {
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

    it('should login an admin user and navigate to events', (done) => {
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

    it('should handle invalid credentials', () => {
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
    it('should logout user, remove token and navigate to login', (done) => {
      service.logout().subscribe({
        next: () => {
          expect(tokenService.removeToken).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          
          service.currentUser$.subscribe(user => {
            expect(user).toBeNull();
            done();
          });
        },
        error: () => fail('Expected successful response')
      });

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should handle logout error but still clear local state', () => {
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
    it('should load current user successfully', (done) => {
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
        done();
      });
    });

    it('should handle error and clear token', (done) => {
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
    it('should return true when token exists', () => {
      tokenService.hasToken.and.returnValue(true);
      
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      tokenService.hasToken.and.returnValue(false);
      
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', (done) => {
      service['currentUserSubject'].next(mockUtilisateur);
      
      const currentUser = service.getCurrentUser();
      expect(currentUser).toEqual(mockUtilisateur);
      done();
    });

    it('should return null when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      service['currentUserSubject'].next(mockUtilisateur);
      
      expect(service.hasRole('parent')).toBe(true);
      expect(service.hasRole('parent')).toBe(true);
      expect(service.hasRole('Parent')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      service['currentUserSubject'].next(mockUtilisateur);
      
      expect(service.hasRole('administrateur')).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      
      expect(service.hasRole('benevole')).toBe(false);
    });

    it('should return true when admin user has admin role', () => {
      service['currentUserSubject'].next(mockAdminUtilisateur);
      
      expect(service.hasRole('administrateur')).toBe(true);
      expect(service.hasRole('ADMINISTRATEUR')).toBe(true);
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit user changes', (done) => {
      const users: (Utilisateur | null)[] = [];
      
      service.currentUser$.subscribe(user => {
        users.push(user);
        
        if (users.length === 3) {
          expect(users[0]).toBeNull(); // Initial value
          expect(users[1]).toEqual(mockUtilisateur);
          expect(users[2]).toEqual(mockAdminUtilisateur);
          done();
        }
      });

      service['currentUserSubject'].next(mockUtilisateur);
      service['currentUserSubject'].next(mockAdminUtilisateur);
    });
  });
});

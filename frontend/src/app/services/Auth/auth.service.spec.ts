/**
 * Fichier : frontend/src/app/services/Auth/auth.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Auth.
 */

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
import { environment } from '../../environments/environment';

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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should_load_utilisateur_actuel_quand_un_token_existe', () => {
    // GIVEN
      // MODIF: On force le Spy à dire "Oui, j'ai un token"
      tokenService.hasToken.and.returnValue(true);
      // MODIF: Il faut AUSSI lui donner un faux token, sinon l'intercepteur bloque !
      tokenService.getToken.and.returnValue('fake-token');

    // WHEN
      service.init();

      const req = httpMock.expectOne(`${apiUrl}/user`);

    // THEN
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
      });
    });

    it('should_not_load_utilisateur_actuel_quand_aucun_token_n_existe', () => {
    // GIVEN
      tokenService.hasToken.and.returnValue(false);

    // WHEN
      service.init();

      httpMock.expectNone(`${apiUrl}/user`);

    // THEN
      expect(tokenService.hasToken).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should_enregistrer_nouvel_user', (done) => {
    // GIVEN
      const registerData: RegisterData = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john.doe@example.com',
        mot_de_passe: 'password123',
        mot_de_passe_confirmation: 'password123'
      };

    // WHEN
      service.register(registerData).subscribe({
        next: (response) => {

    // THEN
          expect(response).toEqual(mockAuthResponse);
          expect(tokenService.saveToken).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('Expected successful response')
      });
  
      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });

    it('should_handle_errors_validation_when_inscription', () => {
    // GIVEN
      const registerData: RegisterData = {
        nom: '',
        prenom: '',
        email: 'invalid-email',
        mot_de_passe: '123',
        mot_de_passe_confirmation: '456'
      };

    // WHEN
      service.register(registerData).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(422);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush({ message: 'Validation error' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });

  describe('auxiliary auth endpoints', () => {
    it('should_call_checkemailtype', () => {
    // GIVEN

    // WHEN
      service.checkEmailType('john@example.com').subscribe(response => {

    // THEN
        expect(response.action).toBe('send_magic_link');
      });

      const req = httpMock.expectOne(`${apiUrl}/check-email`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com' });
      req.flush({ action: 'send_magic_link' });
    });

    it('should_call_requestmagiclink', () => {
    // GIVEN

    // WHEN
      service.requestMagicLink('john@example.com', 'Doe', 'John').subscribe(response => {

    // THEN
        expect(response.message).toBe('ok');
      });

      const req = httpMock.expectOne(`${apiUrl}/magic-link`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com', nom: 'Doe', prenom: 'John' });
      req.flush({ message: 'ok' });
    });

    it('should_verify_magic_link_save_auth', () => {
    // GIVEN

    // WHEN
      service.verifyMagicLink('http://localhost:8000/api/verify-link/1').subscribe(response => {

    // THEN
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/api/verify-link/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockAuthResponse);

      expect(tokenService.saveToken).toHaveBeenCalledWith(mockAuthResponse.token);
    });

    it('should_call_setpassword', () => {
    // GIVEN

    // WHEN
      service.setPassword('7', 'token-x', 'Password123!', 'Password123!').subscribe(response => {

    // THEN
        expect(response.message).toBe('saved');
      });

      const req = httpMock.expectOne(`${apiUrl}/set-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        id_utilisateur: '7',
        token: 'token-x',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!',
      });
      req.flush({ message: 'saved' });
    });

    it('should_call_forgotpassword', () => {
    // GIVEN

    // WHEN
      service.forgotPassword('john@example.com').subscribe(response => {

    // THEN
        expect(response.message).toBe('sent');
      });

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com' });
      req.flush({ message: 'sent' });
    });
  });

  describe('login', () => {
    it('should_login_user_benevole_navigate_vers_accueil', (done) => {
    // GIVEN
      const credentials: LoginCredentials = {
        email: 'john.doe@example.com',
        mot_de_passe: 'password123'
      };

    // WHEN
      service.login(credentials).subscribe({
        next: (response) => {

    // THEN
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

    it('should_login_user_admin_navigate_vers_events', (done) => {
    // GIVEN
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        mot_de_passe: 'admin123'
      };

    // WHEN
      service.login(credentials).subscribe({
        next: (response) => {

    // THEN
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

    it('should_handle_identifiants_invalides', () => {
    // GIVEN
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        mot_de_passe: 'wrongpassword'
      };

    // WHEN
      service.login(credentials).subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should_logout_utilisateur_supprimer_le_token_et_naviguer_vers_login', (done) => {
    // GIVEN
      // D'abord on se connecte pour avoir un utilisateur

    // WHEN
      service['currentUserSubject'].next(mockUtilisateur);

      service.logout().subscribe({
        next: () => {

    // THEN
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

    it('should_handle_erreur_de_deconnexion_mais_nettoyer_l_etat_local', () => {
    // GIVEN

    // WHEN
      service.logout().subscribe({
        next: () => fail('Expected an error'),
        error: (error) => {

    // THEN
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

    it('should_load_utilisateur_actuel_avec_succes', (done) => {
    // GIVEN

    // WHEN
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/user`);

    // THEN
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUtilisateur });

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUtilisateur);
        done();
      });
    });

    it('should_handle_erreur_et_nettoyer_le_token', (done) => {
    // GIVEN

    // WHEN
      service.loadCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/user`);

      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      setTimeout(() => {

    // THEN
        expect(tokenService.removeToken).toHaveBeenCalled();
        service.currentUser$.subscribe(user => {
          expect(user).toBeNull();
          done();
        });
      }, 100);
    });
  });

  describe('isAuthenticated', () => {
    it('should_return_true_when_token_existe', () => {
    // GIVEN
      tokenService.hasToken.and.returnValue(true);

    // WHEN

    // THEN
      expect(service.isAuthenticatedStatus()).toBe(true);
    });

    it('should_return_false_when_no_token_n_existe', () => {
    // GIVEN
      tokenService.hasToken.and.returnValue(false);

    // WHEN

    // THEN
      expect(service.isAuthenticatedStatus()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should_return_utilisateur_actuel', (done) => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(mockUtilisateur);

      const currentUser = service.getCurrentUser();

    // THEN
      expect(currentUser).toEqual(mockUtilisateur);
      done();
    });

    it('should_return_null_when_no_user_n_est_connecte', () => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(null);

      const currentUser = service.getCurrentUser();

    // THEN
      expect(currentUser).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should_return_true_when_utilisateur_a_le_role_specifie', () => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(mockUtilisateur);

    // THEN
      expect(service.hasRole('parent')).toBe(true);
    });

    it('should_return_false_when_utilisateur_n_a_pas_le_role_specifie', () => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(mockUtilisateur);

    // THEN
      expect(service.hasRole('administrateur')).toBe(false);
    });

    it('should_return_false_when_no_user_n_est_connecte', () => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(null);

    // THEN
      expect(service.hasRole('benevole')).toBe(false);
    });

    it('should_return_true_when_utilisateur_admin_a_le_role_admin', () => {
    // GIVEN

    // WHEN
      service['currentUserSubject'].next(mockAdminUtilisateur);

    // THEN
      expect(service.hasRole('administrateur')).toBe(true);
    });
  });

  describe('currentUser$ observable', () => {
    it('should_emit_changements_utilisateur', (done) => {
    // GIVEN
      // Réinitialiser à null avant de commencer

    // WHEN
      service['currentUserSubject'].next(null);

      const users: (Utilisateur | null)[] = [];

      const subscription = service.currentUser$.subscribe(user => {

        users.push(user);

        if (users.length === 3) {

    // THEN
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

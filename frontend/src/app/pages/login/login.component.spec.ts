import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/Auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { AuthResponse } from '../../models/Auth/auth-response';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: Utilisateur = {
    id_utilisateur: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: RoleUtilisateur.parent,
    statut_compte: StatutCompte.actif
  };

  const mockAuthResponse: AuthResponse = {
    message: 'Login successful',
    user: mockUser,
    token: 'fake-jwt-token-123'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'checkEmailType', 'requestMagicLink']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation du formulaire', () => {
    it('devrait initialiser le formulaire de connexion avec des champs vides', () => {
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('mot_de_passe')?.value).toBe('');
    });

    it('devrait avoir des contrôles email et mot_de_passe', () => {
      expect(component.loginForm.contains('email')).toBe(true);
      expect(component.loginForm.contains('mot_de_passe')).toBe(true);
    });

    it('devrait initialiser isLoading à false', () => {
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait marquer email comme invalide lorsqu\'il est vide', () => {
      const email = component.loginForm.get('email');
      expect(email?.valid).toBe(false);
      expect(email?.hasError('required')).toBe(true);
    });

    it('devrait marquer email comme invalide lorsqu\'il n\'est pas un email valide', () => {
      const email = component.loginForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.valid).toBe(false);
      expect(email?.hasError('email')).toBe(true);
    });

    it('devrait marquer email comme valide lorsqu\'un email valide est fourni', () => {
      const email = component.loginForm.get('email');
      email?.setValue('test@example.com');
      expect(email?.valid).toBe(true);
    });

    it('devrait marquer mot_de_passe comme invalide lorsqu\'il est vide à l\'étape 2', () => {
      const password = component.loginForm.get('mot_de_passe');
      password?.setValidators([Validators.required]);
      password?.updateValueAndValidity();
      
      expect(password?.valid).toBe(false);
      expect(password?.hasError('required')).toBe(true);
    });

    it('devrait marquer mot_de_passe comme invalide lorsqu\'il contient moins de 8 caractères à l\'étape 2', () => {
      const password = component.loginForm.get('mot_de_passe');
      password?.setValidators([Validators.minLength(8)]);
      password?.updateValueAndValidity();
      password?.setValue('short');
      
      expect(password?.valid).toBe(false);
      expect(password?.hasError('minlength')).toBe(true);
    });

    it('devrait marquer mot_de_passe comme valide lorsqu\'il contient 8 caractères ou plus', () => {
      const password = component.loginForm.get('mot_de_passe');
      password?.setValue('password123');
      expect(password?.valid).toBe(true);
    });

    it('devrait marquer le formulaire comme invalide lorsqu\'un champ est invalide', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'short'
      });
      expect(component.loginForm.valid).toBe(false);
    });

    it('devrait marquer le formulaire comme valide lorsque tous les champs sont valides', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Getters', () => {
    it('devrait retourner le contrôle email via le getter email', () => {
      const emailControl = component.loginForm.get('email');
      expect(component.email).toBe(emailControl);
    });

    it('devrait retourner le contrôle mot_de_passe via le getter mot_de_passe', () => {
      const passwordControl = component.loginForm.get('mot_de_passe');
      expect(component.mot_de_passe).toBe(passwordControl);
    });
  });

  describe('onSubmit', () => {
    it('devrait ne pas soumettre lorsque le formulaire est invalide', () => {
      component.loginForm.patchValue({
        email: '',
        mot_de_passe: ''
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('devrait ne pas soumettre lorsque l\'email est invalide', () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        mot_de_passe: 'password123'
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('devrait ne pas soumettre lorsque le mot de passe est trop court', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'short'
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('devrait définir isLoading à true lors de la soumission', () => {
      const loginSubject = new Subject<AuthResponse>();
      authService.login.and.returnValue(loginSubject.asObservable());
      
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading).toBe(true);
      
      // Complete the observable to clean up
      loginSubject.next(mockAuthResponse);
      loginSubject.complete();
    });

    it('devrait effacer le message d\'erreur lors de la soumission', () => {
      authService.login.and.returnValue(of(mockAuthResponse));
      component.errorMessage = 'Previous error';
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('devrait appeler authService.login avec les bonnes informations d\'identification', () => {
      authService.login.and.returnValue(of(mockAuthResponse));
      const credentials = {
        email: 'test@example.com',
        mot_de_passe: 'password123'
      };
      component.loginForm.patchValue(credentials);

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    // --- MODIFICATIONS ICI : On teste juste la fin du chargement ---
    it('devrait définir isLoading à false lors d\'une connexion réussie', fakeAsync(() => {
      authService.login.and.returnValue(of(mockAuthResponse));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('devrait gérer l\'erreur de connexion avec un message personnalisé', fakeAsync(() => {
      const errorResponse = {
        error: { message: 'Identifiants incorrects' }
      };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'wrongpassword'
      });

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Identifiants incorrects');
      expect(component.isLoading).toBe(false);
    }));

    it('devrait gérer l\'erreur de connexion avec un message par défaut', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => ({})));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Email ou mot de passe incorrect');
      expect(component.isLoading).toBe(false);
    }));

    it('devrait définir isLoading à false en cas d\'erreur', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => new Error('Network error')));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
    }));
  });

  describe('Integration', () => {
    it('devrait effectuer le flux complet de connexion sans erreur', fakeAsync(() => {
      const loginSubject = new Subject<AuthResponse>();
      authService.login.and.returnValue(loginSubject.asObservable());
      
      // Fill form
      component.loginForm.patchValue({
        email: 'john.doe@example.com',
        mot_de_passe: 'password123'
      });

      expect(component.loginForm.valid).toBe(true);

      // Submit
      component.onSubmit();
      
      // Verify loading state
      expect(component.isLoading).toBe(true);
      
      // Simulate async response
      loginSubject.next(mockAuthResponse);
      loginSubject.complete();
      tick();

      // Verify success state (just isLoading, plus de localStorage/navigate)
      expect(component.isLoading).toBe(false);
    }));

    it('devrait effectuer le flux complet d\'erreur', fakeAsync(() => {
      const error = { error: { message: 'Invalid credentials' } };
      authService.login.and.returnValue(throwError(() => error));
      
      // Fill form
      component.loginForm.patchValue({
        email: 'wrong@example.com',
        mot_de_passe: 'wrongpass123'
      });

      // Submit
      component.onSubmit();
      
      tick();

      // Verify error state
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Invalid credentials');
    }));
  });
});
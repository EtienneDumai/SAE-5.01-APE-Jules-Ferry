/**
 * Fichier : frontend/src/app/pages/login/login.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page login.
 */

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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Initialisation du formulaire', () => {
    it('should_initialize_form_connexion_fields_vides', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('mot_de_passe')?.value).toBe('');
    });

    it('should_avoir_controles_email_password_password', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.loginForm.contains('email')).toBe(true);
      expect(component.loginForm.contains('mot_de_passe')).toBe(true);
    });

    it('should_initialize_isloading_false', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Validation du formulaire', () => {
    it('should_mark_email_comme_invalid_lorsqu_il_est_vide', () => {
    // GIVEN

    // WHEN
      const email = component.loginForm.get('email');

    // THEN
      expect(email?.valid).toBe(false);
      expect(email?.hasError('required')).toBe(true);
    });

    it('should_mark_email_comme_invalid_lorsqu_il_n_est_pas_un_email_valide', () => {
    // GIVEN

    // WHEN
      const email = component.loginForm.get('email');

      email?.setValue('invalid-email');

    // THEN
      expect(email?.valid).toBe(false);
      expect(email?.hasError('email')).toBe(true);
    });

    it('should_mark_email_comme_valid_lorsqu_un_email_valide_est_fourni', () => {
    // GIVEN

    // WHEN
      const email = component.loginForm.get('email');

      email?.setValue('test@example.com');

    // THEN
      expect(email?.valid).toBe(true);
    });

    it('should_mark_password_password_comme_invalid_lorsqu_il_est_vide_a_l_etape_2', () => {
    // GIVEN

    // WHEN
      const password = component.loginForm.get('mot_de_passe');
      password?.setValidators([Validators.required]);

      password?.updateValueAndValidity();

    // THEN
      expect(password?.valid).toBe(false);
      expect(password?.hasError('required')).toBe(true);
    });

    it('should_mark_password_password_comme_invalid_lorsqu_il_contient_moins_de_8_caracteres_a_l_etape_2', () => {
    // GIVEN

    // WHEN
      const password = component.loginForm.get('mot_de_passe');
      password?.setValidators([Validators.minLength(8)]);
      password?.updateValueAndValidity();

      password?.setValue('short');

    // THEN
      expect(password?.valid).toBe(false);
      expect(password?.hasError('minlength')).toBe(true);
    });

    it('should_mark_password_password_comme_valid_lorsqu_il_contient_8_caracteres_ou_plus', () => {
    // GIVEN

    // WHEN
      const password = component.loginForm.get('mot_de_passe');

      password?.setValue('password123');

    // THEN
      expect(password?.valid).toBe(true);
    });

    it('should_mark_form_comme_invalid_lorsqu_un_champ_est_invalide', () => {
    // GIVEN
      component.loginForm.patchValue({
        email: '',
        mot_de_passe: 'password123'
      });

    // WHEN

    // THEN
      expect(component.loginForm.valid).toBe(false);
    });

    it('should_mark_form_comme_valid_lorsque_all_fields_valides', () => {
    // GIVEN
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN

    // THEN
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Getters', () => {
    it('should_return_controle_email_getter_email', () => {
    // GIVEN

    // WHEN
      const emailControl = component.loginForm.get('email');

    // THEN
      expect(component.email).toBe(emailControl);
    });

    it('should_return_controle_password_password_getter_password_password', () => {
    // GIVEN

    // WHEN
      const passwordControl = component.loginForm.get('mot_de_passe');

    // THEN
      expect(component.mot_de_passe).toBe(passwordControl);
    });
  });

  describe('verifierEmail', () => {
    it('should_display_message_serveur_when_no_account_n_est_associe_a_l_email', fakeAsync(() => {
    // GIVEN
      authService.checkEmailType.and.returnValue(of({
        action: 'not_found',
        message: 'Aucun compte associé à cet email. Veuillez vous inscrire.'
      }));
      component.loginForm.patchValue({ email: 'inconnu@example.com' });

    // WHEN
      component.verifierEmail();

      tick();

    // THEN
      expect(component.errorMessage).toBe('Aucun compte associé à cet email. Veuillez vous inscrire.');
      expect(component.isLoading).toBe(false);
    }));

    it('should_display_message_clair_verification_email_echoue', fakeAsync(() => {
    // GIVEN
      authService.checkEmailType.and.returnValue(throwError(() => ({})));
      component.loginForm.patchValue({ email: 'test@example.com' });

    // WHEN
      component.verifierEmail();

      tick();

    // THEN
      expect(component.errorMessage).toBe("Impossible de vérifier cette adresse email. Vérifiez sa saisie ou réessayez dans un instant.");
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('onSubmit', () => {
    it('should_ne_pas_soumettre_lorsque_form_invalid', () => {
    // GIVEN
      component.loginForm.patchValue({
        email: '',
        mot_de_passe: ''
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should_ne_pas_soumettre_lorsque_email_est_invalide', () => {
    // GIVEN
      component.loginForm.patchValue({
        email: 'invalid-email',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should_ne_pas_soumettre_lorsque_password_password_trop_court_etape_2', () => {
    // GIVEN

    // WHEN
      const password = component.loginForm.get('mot_de_passe');
      password?.setValidators([Validators.minLength(8)]);
      password?.updateValueAndValidity();

      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'short'
      });

      component.onSubmit();

    // THEN
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should_definir_isloading_true_when_soumission', () => {
    // GIVEN
      const loginSubject = new Subject<AuthResponse>();
      authService.login.and.returnValue(loginSubject.asObservable());

      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(component.isLoading).toBe(true);

      // Complete the observable to clean up
      loginSubject.next(mockAuthResponse);
      loginSubject.complete();
    });

    it('should_effacer_message_erreur_lors_de_la_soumission', () => {
    // GIVEN
      authService.login.and.returnValue(of(mockAuthResponse));
      component.errorMessage = 'Previous error';
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(component.errorMessage).toBe('');
    });

    it('should_call_authservice_login_bonnes_informations_identification', () => {
    // GIVEN
      authService.login.and.returnValue(of(mockAuthResponse));
      const credentials = {
        email: 'test@example.com',
        mot_de_passe: 'password123'
      };
      component.loginForm.patchValue(credentials);

    // WHEN
      component.onSubmit();

    // THEN
      expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    // --- MODIFICATIONS ICI : On teste juste la fin du chargement ---
    it('should_definir_isloading_false_lors_une_connexion_reussie', fakeAsync(() => {
    // GIVEN
      authService.login.and.returnValue(of(mockAuthResponse));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(component.isLoading).toBe(false);
    }));

    it('should_handle_erreur_de_connexion_avec_un_message_personnalise', fakeAsync(() => {
    // GIVEN
      const errorResponse = {
        error: { message: 'Identifiants incorrects' }
      };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'wrongpassword'
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(component.errorMessage).toBe('Identifiants incorrects');
      expect(component.isLoading).toBe(false);
    }));

    it('should_handle_erreur_de_connexion_avec_un_message_par_defaut', fakeAsync(() => {
    // GIVEN
      authService.login.and.returnValue(throwError(() => ({})));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(component.errorMessage).toBe('Email ou mot de passe incorrect');
      expect(component.isLoading).toBe(false);
    }));

    it('should_definir_isloading_false_cas_erreur', fakeAsync(() => {
    // GIVEN
      authService.login.and.returnValue(throwError(() => new Error('Network error')));
      component.loginForm.patchValue({
        email: 'test@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('Integration', () => {
    it('should_effectuer_flux_complet_connexion_sans_error', fakeAsync(() => {
    // GIVEN
      const loginSubject = new Subject<AuthResponse>();

      authService.login.and.returnValue(loginSubject.asObservable());

      // Fill form
      component.loginForm.patchValue({
        email: 'john.doe@example.com',
        mot_de_passe: 'password123'
      });

    // WHEN

    // THEN
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

    it('should_effectuer_flux_complet_erreur', fakeAsync(() => {
    // GIVEN
      const error = { error: { message: 'Invalid credentials' } };
      authService.login.and.returnValue(throwError(() => error));

      // Fill form
      component.loginForm.patchValue({
        email: 'wrong@example.com',
        mot_de_passe: 'wrongpass123'
      });

      // Submit

    // WHEN
      component.onSubmit();

      tick();

      // Verify error state

    // THEN
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Invalid credentials');
    }));
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/Auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { AuthResponse } from '../../models/Auth/auth-response';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser: Utilisateur = {
    id_utilisateur: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    role: RoleUtilisateur.parent,
    statut_compte: StatutCompte.actif
  };

  const mockAuthResponse: AuthResponse = {
    message: 'Registration successful',
    user: mockUser,
    token: 'fake-jwt-token-789'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
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

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation du formulaire', () => {
    it('devrait initialiser le formulaire d\'inscription avec des champs vides', () => {
      expect(component.registerForm).toBeTruthy();
      expect(component.registerForm.get('nom')?.value).toBe('');
      expect(component.registerForm.get('prenom')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('mot_de_passe')?.value).toBe('');
      expect(component.registerForm.get('mot_de_passe_confirmation')?.value).toBe('');
    });

    it('devrait avoir tous les contrôles requis', () => {
      expect(component.registerForm.contains('nom')).toBe(true);
      expect(component.registerForm.contains('prenom')).toBe(true);
      expect(component.registerForm.contains('email')).toBe(true);
      expect(component.registerForm.contains('mot_de_passe')).toBe(true);
      expect(component.registerForm.contains('mot_de_passe_confirmation')).toBe(true);
    });

    it('devrait initialiser isLoading à false', () => {
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait être invalide quand le formulaire est vide', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('devrait être valide avec des données correctes', () => {
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });
      expect(component.registerForm.valid).toBeTruthy();
    });
  });

  describe('Validation du champ nom', () => {
    it('devrait être requis', () => {
      const nom = component.registerForm.get('nom');
      nom?.setValue('');
      expect(nom?.hasError('required')).toBe(true);
    });

    it('devrait accepter un nom valide', () => {
      const nom = component.registerForm.get('nom');
      nom?.setValue('Dupont');
      expect(nom?.valid).toBe(true);
    });

    it('devrait refuser un nom trop long (> 50 caractères)', () => {
      const nom = component.registerForm.get('nom');
      nom?.setValue('a'.repeat(51));
      expect(nom?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Validation du champ prenom', () => {
    it('devrait être requis', () => {
      const prenom = component.registerForm.get('prenom');
      prenom?.setValue('');
      expect(prenom?.hasError('required')).toBe(true);
    });

    it('devrait accepter un prénom valide', () => {
      const prenom = component.registerForm.get('prenom');
      prenom?.setValue('Jean');
      expect(prenom?.valid).toBe(true);
    });

    it('devrait refuser un prénom trop long (> 50 caractères)', () => {
      const prenom = component.registerForm.get('prenom');
      prenom?.setValue('a'.repeat(51));
      expect(prenom?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Validation du champ email', () => {
    it('devrait être requis', () => {
      const email = component.registerForm.get('email');
      email?.setValue('');
      expect(email?.hasError('required')).toBe(true);
    });

    it('devrait valider un email correct', () => {
      const email = component.registerForm.get('email');
      email?.setValue('test@example.com');
      expect(email?.valid).toBe(true);
    });

    it('devrait invalider un email incorrect', () => {
      const email = component.registerForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);
    });

    it('devrait refuser un email trop long (> 100 caractères)', () => {
      const email = component.registerForm.get('email');
      const longEmail = 'a'.repeat(95) + '@test.com'; // 105 caractères
      email?.setValue(longEmail);
      expect(email?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Validation du champ mot_de_passe', () => {
    it('devrait être requis', () => {
      const password = component.registerForm.get('mot_de_passe');
      password?.setValue('');
      expect(password?.hasError('required')).toBe(true);
    });

    it('devrait exiger au moins 8 caractères', () => {
      const password = component.registerForm.get('mot_de_passe');
      password?.setValue('Short1!');
      expect(password?.hasError('minlength')).toBe(true);
    });

    it('devrait exiger une majuscule, un chiffre et un caractère spécial', () => {
      const password = component.registerForm.get('mot_de_passe');
      
      password?.setValue('password123!'); // Pas de majuscule
      expect(password?.hasError('pattern')).toBe(true);
      
      password?.setValue('Password!'); // Pas de chiffre
      expect(password?.hasError('pattern')).toBe(true);
      
      password?.setValue('Password123'); // Pas de caractère spécial
      expect(password?.hasError('pattern')).toBe(true);
    });

    it('devrait accepter un mot de passe valide', () => {
      const password = component.registerForm.get('mot_de_passe');
      password?.setValue('Password123!');
      expect(password?.valid).toBe(true);
    });
  });

  describe('Validation du champ mot_de_passe_confirmation', () => {
    it('devrait être requis', () => {
      const confirmation = component.registerForm.get('mot_de_passe_confirmation');
      confirmation?.setValue('');
      expect(confirmation?.hasError('required')).toBe(true);
    });

    it('devrait correspondre au mot de passe', () => {
      component.registerForm.patchValue({
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });
      component.registerForm.updateValueAndValidity();
      
      const confirmation = component.registerForm.get('mot_de_passe_confirmation');
      expect(confirmation?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('devrait invalider si les mots de passe ne correspondent pas', () => {
      component.registerForm.patchValue({
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Different123!'
      });
      component.registerForm.updateValueAndValidity();
      
      const confirmation = component.registerForm.get('mot_de_passe_confirmation');
      expect(confirmation?.hasError('passwordMismatch')).toBe(true);
    });

    it('devrait nettoyer l\'erreur quand les mots de passe correspondent', () => {
      // D'abord définir des mots de passe différents
      component.registerForm.patchValue({
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Different123!'
      });
      component.registerForm.updateValueAndValidity();
      
      const confirmation = component.registerForm.get('mot_de_passe_confirmation');
      expect(confirmation?.hasError('passwordMismatch')).toBe(true);
      
      // Ensuite les faire correspondre
      component.registerForm.patchValue({
        mot_de_passe_confirmation: 'Password123!'
      });
      component.registerForm.updateValueAndValidity();
      
      expect(confirmation?.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Getters', () => {
    it('devrait retourner le contrôle nom', () => {
      expect(component.nom).toBe(component.registerForm.get('nom'));
    });

    it('devrait retourner le contrôle prenom', () => {
      expect(component.prenom).toBe(component.registerForm.get('prenom'));
    });

    it('devrait retourner le contrôle email', () => {
      expect(component.email).toBe(component.registerForm.get('email'));
    });

    it('devrait retourner le contrôle mot_de_passe', () => {
      expect(component.mot_de_passe).toBe(component.registerForm.get('mot_de_passe'));
    });

    it('devrait retourner le contrôle mot_de_passe_confirmation', () => {
      expect(component.mot_de_passe_confirmation).toBe(component.registerForm.get('mot_de_passe_confirmation'));
    });

    it('devrait retourner true pour passwordMismatch quand les mots de passe ne correspondent pas et que le champ est touché', () => {
      component.registerForm.patchValue({
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Different123!'
      });
      component.registerForm.updateValueAndValidity();
      component.mot_de_passe_confirmation?.markAsTouched();
      
      expect(component.passwordMismatch).toBe(true);
    });

    it('devrait retourner false pour passwordMismatch quand le champ n\'est pas touché', () => {
      component.registerForm.patchValue({
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Different123!'
      });
      component.registerForm.updateValueAndValidity();
      
      expect(component.passwordMismatch).toBeFalsy();
    });
  });

  describe('onSubmit', () => {
    it('ne devrait pas soumettre si le formulaire est invalide', () => {
      component.registerForm.patchValue({
        nom: '',
        prenom: '',
        email: '',
        mot_de_passe: '',
        mot_de_passe_confirmation: ''
      });

      component.onSubmit();

      expect(authService.register).not.toHaveBeenCalled();
    });

    it('devrait définir isLoading à true lors de la soumission', () => {
      const registerSubject = new Subject<AuthResponse>();
      authService.register.and.returnValue(registerSubject.asObservable());
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.isLoading).toBe(true);
      
      registerSubject.next(mockAuthResponse);
      registerSubject.complete();
    });

    it('devrait effacer le message d\'erreur lors de la soumission', () => {
      authService.register.and.returnValue(of(mockAuthResponse));
      component.errorMessage = 'Erreur précédente';
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('devrait appeler authService.register avec les bonnes données', () => {
      authService.register.and.returnValue(of(mockAuthResponse));
      
      const formData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      };
      
      component.registerForm.patchValue(formData);

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith(formData);
    });

    it('devrait naviguer vers la page d\'accueil en cas de succès', fakeAsync(() => {
      const registerSubject = new Subject<AuthResponse>();
      authService.register.and.returnValue(registerSubject.asObservable());
      spyOn(console, 'log');
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();
      
      registerSubject.next(mockAuthResponse);
      registerSubject.complete();
      tick();

      expect(console.log).toHaveBeenCalledWith('Inscription réussie', mockAuthResponse);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('devrait mettre isLoading à false en cas de succès', fakeAsync(() => {
      authService.register.and.returnValue(of(mockAuthResponse));
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('devrait gérer les erreurs de validation du serveur', () => {
      const error = {
        error: {
          errors: {
            email: ['L\'email est déjà utilisé']
          }
        }
      };
      authService.register.and.returnValue(throwError(() => error));
      spyOn(console, 'error');
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('L\'email est déjà utilisé');
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('devrait gérer un message d\'erreur générique du serveur', () => {
      const error = {
        error: {
          message: 'Erreur serveur'
        }
      };
      authService.register.and.returnValue(throwError(() => error));
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Erreur serveur');
      expect(component.isLoading).toBe(false);
    });

    it('devrait afficher un message d\'erreur par défaut si aucun message n\'est fourni', () => {
      const error = { error: {} };
      authService.register.and.returnValue(throwError(() => error));
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Une erreur est survenue lors de l\'inscription');
      expect(component.isLoading).toBe(false);
    });

    it('devrait mettre isLoading à false en cas d\'erreur', () => {
      authService.register.and.returnValue(throwError(() => new Error('Erreur réseau')));
      
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Intégration', () => {
    it('devrait effectuer le flux complet d\'inscription', fakeAsync(() => {
      const registerSubject = new Subject<AuthResponse>();
      authService.register.and.returnValue(registerSubject.asObservable());
      
      // Remplir le formulaire
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'Password123!',
        mot_de_passe_confirmation: 'Password123!'
      });

      expect(component.registerForm.valid).toBe(true);

      // Soumettre
      component.onSubmit();
      
      // Vérifier l'état de chargement
      expect(component.isLoading).toBe(true);
      
      // Simuler la réponse asynchrone
      registerSubject.next(mockAuthResponse);
      registerSubject.complete();
      tick();

      // Vérifier l'état final
      expect(component.isLoading).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));
  });
});

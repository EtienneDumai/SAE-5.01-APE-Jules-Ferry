import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/Auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
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

  const mockRegisterResponse = {
    message: 'Inscription réussie',
    user: mockUser
  };

  const mockMagicLinkResponse = { message: 'Lien envoyé' };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'requestMagicLink']);

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
    it('devrait initialiser le formulaire avec des champs vides', () => {
      expect(component.registerForm).toBeTruthy();
      expect(component.registerForm.get('nom')?.value).toBe('');
      expect(component.registerForm.get('prenom')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
    });

    it('devrait avoir les contrôles nom, prenom et email', () => {
      expect(component.registerForm.contains('nom')).toBe(true);
      expect(component.registerForm.contains('prenom')).toBe(true);
      expect(component.registerForm.contains('email')).toBe(true);
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
      email?.setValue('a'.repeat(95) + '@test.com');
      expect(email?.hasError('maxlength')).toBe(true);
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
  });

  describe('onSubmit', () => {
    it('ne devrait pas soumettre si le formulaire est invalide', () => {
      component.registerForm.patchValue({ nom: '', prenom: '', email: '' });
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('devrait définir isLoading à true lors de la soumission', () => {
      const registerSubject = new Subject<{ message: string; user: Utilisateur }>();
      authService.register.and.returnValue(registerSubject.asObservable());

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      component.onSubmit();
      expect(component.isLoading).toBe(true);

      registerSubject.next(mockRegisterResponse);
      registerSubject.complete();
    });

    it('devrait effacer le message d\'erreur lors de la soumission', () => {
      authService.register.and.returnValue(of(mockRegisterResponse));
      authService.requestMagicLink.and.returnValue(of(mockMagicLinkResponse));
      component.errorMessage = 'Erreur précédente';

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      component.onSubmit();
      expect(component.errorMessage).toBe('');
    });

    it('devrait envoyer le magic link après inscription réussie', fakeAsync(() => {
      authService.register.and.returnValue(of(mockRegisterResponse));
      authService.requestMagicLink.and.returnValue(of(mockMagicLinkResponse));

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      component.onSubmit();
      tick();

      expect(authService.requestMagicLink).toHaveBeenCalledWith('jean.dupont@example.com');
      expect(component.successMessage).toBeTruthy();
      expect(component.isLoading).toBe(false);
    }));

    it('devrait gérer les erreurs de validation du serveur', () => {
      const error = { error: { errors: { email: ['L\'email est déjà utilisé'] } } };
      authService.register.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('L\'email est déjà utilisé');
      expect(component.isLoading).toBe(false);
    });

    it('devrait gérer un message d\'erreur générique du serveur', () => {
      const error = { error: { message: 'Erreur serveur' } };
      authService.register.and.returnValue(throwError(() => error));

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
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
      });

      component.onSubmit();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Intégration', () => {
    it('devrait effectuer le flux complet d\'inscription', fakeAsync(() => {
      authService.register.and.returnValue(of(mockRegisterResponse));
      authService.requestMagicLink.and.returnValue(of(mockMagicLinkResponse));

      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      expect(component.registerForm.valid).toBe(true);

      component.onSubmit();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.successMessage).toBeTruthy();
      expect(authService.requestMagicLink).toHaveBeenCalled();
    }));
  });
});
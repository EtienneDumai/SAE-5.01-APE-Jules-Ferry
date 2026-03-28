/**
 * Fichier : frontend/src/app/pages/register/register.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page register.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/Auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
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
    user: mockUser,
    token: 'fake-jwt-token'
  };

  const mockMagicLinkResponse = { message: 'Lien envoyé' };

  beforeEach(async () => {
    // On déclare nos Spies
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
    
    // Configure les retours par défaut pour éviter les erreurs "undefined subscribe"
    authService.register.and.returnValue(of(mockRegisterResponse));
    authService.requestMagicLink.and.returnValue(of(mockMagicLinkResponse));

    fixture.detectChanges(); // Déclenche le ngOnInit
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

  // (Je garde tes tests de validation de champs, ils sont parfaits)
  describe('Validation du champ nom', () => {
    it('devrait être requis', () => {
      const nom = component.registerForm.get('nom');
      nom?.setValue('');
      expect(nom?.hasError('required')).toBe(true);
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

    it('devrait invalider un email incorrect', () => {
      const email = component.registerForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('ne devrait pas soumettre si le formulaire est invalide', () => {
      component.registerForm.patchValue({ nom: '', prenom: '', email: '' });
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('devrait envoyer le magic link après inscription réussie', () => {
      // Les spies retournent déjà "of(...)" grâce au beforeEach
      component.registerForm.patchValue({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
      });

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      expect(authService.requestMagicLink).toHaveBeenCalledWith('jean.dupont@example.com');
      expect(component.isLoading).toBe(false);
      expect(component.successMessage).toBe("Inscription réussie ! Un lien de connexion vous a été envoyé par email.");
    });

    it('devrait gérer les erreurs d\'inscription du serveur', () => {
      const error = { error: { errors: { email: ['L\'email est déjà utilisé'] } } };
      authService.register.and.returnValue(throwError(() => error));
      
      component.registerForm.patchValue({
        nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('L\'email est déjà utilisé');
      expect(component.isLoading).toBe(false);
      expect(authService.requestMagicLink).not.toHaveBeenCalled();
    });

    it('devrait rediriger si l\'inscription réussit mais que l\'envoi du mail échoue', fakeAsync(() => {
      authService.requestMagicLink.and.returnValue(throwError(() => new Error('Mail error')));

      component.registerForm.patchValue({
        nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com',
      });

      component.onSubmit();
      
      expect(component.isLoading).toBe(false);
      expect(component.successMessage).toBe("Inscription réussie ! Connectez-vous via la page de connexion.");
      
      tick(2000);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });
});
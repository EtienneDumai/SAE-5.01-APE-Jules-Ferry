/**
 * Fichier : frontend/src/app/components/footer/footer.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant footer.
 */

import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { BehaviorSubject } from 'rxjs';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { NewsletterService } from '../../services/Newsletter/newsletter.service';
import { ToastService } from '../../services/Toast/toast.service';
import { of, throwError } from 'rxjs';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let utilisateurService: jasmine.SpyObj<UtilisateurService>;
  let newsletterService: jasmine.SpyObj<NewsletterService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let utilisateurCourantSubject: BehaviorSubject<Utilisateur | null>;

  const mockUser: Utilisateur = {
    id: 1,
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@example.com',
    role: RoleUtilisateur.administrateur,
  } as unknown as Utilisateur;

  beforeEach(async () => {
    utilisateurCourantSubject = new BehaviorSubject<Utilisateur | null>(null);

    const utilisateurServiceSpy = jasmine.createSpyObj(
      'UtilisateurService',
      ['setUtilisateurCourant'],
      {
        utilisateurCourant: utilisateurCourantSubject.asObservable()
      }
    );

    newsletterService = jasmine.createSpyObj<NewsletterService>('NewsletterService', ['subscribe']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['showWithTimeout']);

    TestBed.configureTestingModule({
      providers: [
        { provide: UtilisateurService, useValue: utilisateurServiceSpy },
        { provide: NewsletterService, useValue: newsletterService },
        { provide: ToastService, useValue: toastService }
      ],
    });

    utilisateurService = TestBed.inject(UtilisateurService) as jasmine.SpyObj<UtilisateurService>;
    component = TestBed.runInInjectionContext(() => new FooterComponent());
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('devrait initialiser utilisateurCourant depuis le service', () => {
      component.ngOnInit();
      expect(component.utilisateurCourant).toBeDefined();
      expect(component.utilisateurCourant).toBe(utilisateurService.utilisateurCourant);
    });

    it('devrait recevoir un utilisateur null initialement', (done) => {
      component.ngOnInit();
      component.utilisateurCourant.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('devrait recevoir les mises à jour d\'utilisateur depuis le service', (done) => {
      component.ngOnInit();
      utilisateurCourantSubject.next(mockUser);
      
      component.utilisateurCourant.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('setUtilisateur', () => {
    it('devrait appeler utilisateurService.setUtilisateurCourant avec l\'utilisateur', () => {
      component.setUtilisateur(mockUser);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(mockUser);
    });

    it('devrait appeler utilisateurService.setUtilisateurCourant avec null', () => {
      component.setUtilisateur(null);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(null);
    });
  });

  describe('roleUtilisateur', () => {
    it('devrait avoir la propriété roleUtilisateur définie sur l\'enum RoleUtilisateur', () => {
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });

  describe('onSubscribe', () => {
    it('refuse si le rgpd n est pas accepté', () => {
      component.rgpdAccepted = false;
      component.emailNewsletter = 'ok@example.com';

      component.onSubscribe();

      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Veuillez accepter le traitement de vos données.',
        TypeErreurToast.ERROR
      );
      expect(newsletterService.subscribe).not.toHaveBeenCalled();
    });

    it('refuse si l email est invalide', () => {
      component.rgpdAccepted = true;
      component.emailNewsletter = 'bad-email';

      component.onSubscribe();

      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Veuillez saisir un email valide.',
        TypeErreurToast.ERROR
      );
      expect(newsletterService.subscribe).not.toHaveBeenCalled();
    });

    it('gère une inscription newsletter réussie', () => {
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(of({ message: 'Inscription ok' }));

      component.onSubscribe();

      expect(newsletterService.subscribe).toHaveBeenCalledWith({ email: 'ok@example.com' });
      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Inscription ok', TypeErreurToast.SUCCESS);
      expect(component.emailNewsletter).toBe('');
      expect(component.rgpdAccepted).toBeFalse();
      expect(component.isSubmitting).toBeFalse();
    });

    it('affiche le message de validation email du backend', () => {
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(throwError(() => ({
        status: 422,
        error: { errors: { email: ['Email déjà utilisé'] } }
      })));

      component.onSubscribe();

      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Email déjà utilisé', TypeErreurToast.ERROR);
      expect(component.isSubmitting).toBeFalse();
    });

    it('affiche le message générique du backend en cas d erreur', () => {
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(throwError(() => ({
        status: 500,
        error: { message: 'Erreur personnalisée' }
      })));

      component.onSubscribe();

      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Erreur personnalisée', TypeErreurToast.ERROR);
      expect(component.isSubmitting).toBeFalse();
    });
  });
});

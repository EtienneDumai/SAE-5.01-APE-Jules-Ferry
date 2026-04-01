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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should_initialize_utilisateurcourant_service', () => {
    // GIVEN

    // WHEN
      component.ngOnInit();

    // THEN
      expect(component.utilisateurCourant).toBeDefined();
      expect(component.utilisateurCourant).toBe(utilisateurService.utilisateurCourant);
    });

    it('should_recevoir_user_null_initialement', (done) => {
    // GIVEN

    // WHEN
      component.ngOnInit();
      component.utilisateurCourant.subscribe(user => {

    // THEN
        expect(user).toBeNull();
        done();
      });
    });

    it('should_recevoir_mises_jour_utilisateur_depuis_le_service', (done) => {
    // GIVEN

    // WHEN
      component.ngOnInit();

      utilisateurCourantSubject.next(mockUser);
      
      component.utilisateurCourant.subscribe(user => {

    // THEN
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('setUtilisateur', () => {
    it('should_call_utilisateurservice_setutilisateurcourant_utilisateur', () => {
    // GIVEN

    // WHEN
      component.setUtilisateur(mockUser);

    // THEN
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(mockUser);
    });

    it('should_call_utilisateurservice_setutilisateurcourant_null', () => {
    // GIVEN

    // WHEN
      component.setUtilisateur(null);

    // THEN
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(null);
    });
  });

  describe('roleUtilisateur', () => {
    it('should_avoir_property_roleutilisateur_definie_enum_roleutilisateur', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });

  describe('onSubscribe', () => {
    it('should_deny_rgpd_n_pas_accepte', () => {
    // GIVEN
      component.rgpdAccepted = false;
      component.emailNewsletter = 'ok@example.com';

    // WHEN
      component.onSubscribe();

    // THEN
      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Veuillez accepter le traitement de vos données.',
        TypeErreurToast.ERROR
      );
      expect(newsletterService.subscribe).not.toHaveBeenCalled();
    });

    it('should_deny_email_invalid', () => {
    // GIVEN
      component.rgpdAccepted = true;
      component.emailNewsletter = 'bad-email';

    // WHEN
      component.onSubscribe();

    // THEN
      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Veuillez saisir un email valide.',
        TypeErreurToast.ERROR
      );
      expect(newsletterService.subscribe).not.toHaveBeenCalled();
    });

    it('should_handle_inscription_newsletter_reussie', () => {
    // GIVEN
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(of({ message: 'Inscription ok' }));

    // WHEN
      component.onSubscribe();

    // THEN
      expect(newsletterService.subscribe).toHaveBeenCalledWith({ email: 'ok@example.com' });
      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Inscription ok', TypeErreurToast.SUCCESS);
      expect(component.emailNewsletter).toBe('');
      expect(component.rgpdAccepted).toBeFalse();
      expect(component.isSubmitting).toBeFalse();
    });

    it('should_display_message_validation_email_backend', () => {
    // GIVEN
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(throwError(() => ({
        status: 422,
        error: { errors: { email: ['Email déjà utilisé'] } }
      })));

    // WHEN
      component.onSubscribe();

    // THEN
      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Email déjà utilisé', TypeErreurToast.ERROR);
      expect(component.isSubmitting).toBeFalse();
    });

    it('should_display_message_generique_backend_cas_error', () => {
    // GIVEN
      component.rgpdAccepted = true;
      component.emailNewsletter = 'ok@example.com';
      newsletterService.subscribe.and.returnValue(throwError(() => ({
        status: 500,
        error: { message: 'Erreur personnalisée' }
      })));

    // WHEN
      component.onSubscribe();

    // THEN
      expect(toastService.showWithTimeout).toHaveBeenCalledWith('Erreur personnalisée', TypeErreurToast.ERROR);
      expect(component.isSubmitting).toBeFalse();
    });
  });
});

/**
 * Fichier : frontend/src/app/components/card/evenement-card/evenement-card.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant evenement card.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvenementCardComponent } from './evenement-card.component';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { of, throwError } from 'rxjs';
import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('EvenementCardComponent', () => {
  let component: EvenementCardComponent;
  let fixture: ComponentFixture<EvenementCardComponent>;

  let authService: jasmine.SpyObj<AuthService>;
  let evenementService: jasmine.SpyObj<EvenementService>;
  let router: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'getCurrentUser'], {
      currentUser$: of(null)
    });
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['deleteEvenement']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout']);
    
    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [EvenementCardComponent, DatePipe],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    evenementService = TestBed.inject(EvenementService) as jasmine.SpyObj<EvenementService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    fixture = TestBed.createComponent(EvenementCardComponent);
    component = fixture.componentInstance;

    component.id_evenement = 1;
    component.titre = 'Événement Test';
    component.description = 'Description Test';
    component.date_evenement = new Date();
    component.heure_debut = '10:00';
    component.heure_fin = '12:00';
    component.lieu = 'Salle Test';
    component.statut = StatutEvenement.publie;
    component.image_url = 'test.jpg';
    component.id_formulaire = 1;

    fixture.detectChanges();
  });
  
  describe('Initialisation du composant', () => {
    it('should_create', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component).toBeTruthy();
    });

    it('should_initialize_inputs_correctement', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.titre).toBe('Événement Test');
      expect(component.id_evenement).toBe(1);
    });
  });

  describe('Redirection vers formulaire d\'inscription', () => {
    it('should_display_login_when_non_authentifie', () => {
    // GIVEN
      component.isAuthenticated = false;

    // WHEN
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

    // THEN
      expect(compiled.textContent).toContain('Se connecter');
    });

    it('should_display_s_inscrire_quand_authentifie', () => {
    // GIVEN
      component.isAuthenticated = true;

    // WHEN
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

    // THEN
      expect(compiled.textContent).toContain('S\'inscrire');
    });

    it('should_avoir_deux_boutons_navigation_card', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      const navigationButtons = Array.from(buttons).filter(btn => {
        const text = btn.textContent?.trim();
        return text === 'Voir la fiche' || text === 'S\'inscrire' || text === 'Se connecter';
      });

    // THEN
      expect(navigationButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Gestion des URLs d\'images', () => {
    it('should_return_chaine_empty_no_url', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.getImageUrl('')).toBe('');
    });
  });

  describe('Gestion des permissions (canManage)', () => {
    it('should_return_true_utilisateur_est_admin', () => {
    // GIVEN
      component.currentUser = { id_utilisateur: 1, role: 'administrateur' } as Utilisateur;

    // WHEN

    // THEN
      expect(component.canManage).toBe(true);
    });

    it('should_return_true_utilisateur_est_membre_bureau_et_est_createur', () => {
    // GIVEN
      component.id_auteur = 10;
      component.currentUser = { id_utilisateur: 10, role: 'membre_bureau' } as Utilisateur;

    // WHEN

    // THEN
      expect(component.canManage).toBe(true);
    });

    it('should_return_false_utilisateur_est_membre_bureau_mais_pas_createur', () => {
    // GIVEN
      component.id_auteur = 10;
      component.currentUser = { id_utilisateur: 99, role: 'membre_bureau' } as Utilisateur;

    // WHEN

    // THEN
      expect(component.canManage).toBe(false);
    });

    it('should_return_false_autres_roles', () => {
    // GIVEN
      authService.hasRole.and.returnValue(false);

    // WHEN

    // THEN
      expect(component.canManage).toBe(false);
    });
  });

  describe('Navigation (Edition)', () => {
    it('should_navigate_vers_page_edition_lors_de_onedit', () => {
    // GIVEN
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

    // WHEN
      component.onEdit(event);

    // THEN
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/evenements', 1, 'edit']);
    });
  });

  describe('Suppression d\'événement', () => {
    it('should_open_modal_suppression_when_clicking_ondelete', () => {
    // GIVEN
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

    // WHEN
      component.onDelete(event);

    // THEN
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.showDeleteModal).toBeTrue();
      expect(component.deletePassword).toBe('');
    });

    it('should_not_delete_password_password_empty', () => {
    // GIVEN
      component.deletePassword = '';

    // WHEN
      component.confirmerSuppression();

    // THEN
      expect(evenementService.deleteEvenement).not.toHaveBeenCalled();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith("Le mot de passe est requis.", TypeErreurToast.ERROR);
    });

    it('should_delete_emit_eventdeleted_confirme_password_password', () => {
    // GIVEN
      spyOn(component.eventDeleted, 'emit');
      component.deletePassword = 'monMotDePasse';
      evenementService.deleteEvenement.and.returnValue(of({ message: 'Success' }));

    // WHEN
      component.confirmerSuppression();

    // THEN
      expect(evenementService.deleteEvenement).toHaveBeenCalledWith(1, 'monMotDePasse');
      expect(component.eventDeleted.emit).toHaveBeenCalledWith(1);
      expect(component.showDeleteModal).toBeFalse();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith('Événement supprimé avec succès.', TypeErreurToast.SUCCESS);
    });

    it('should_handle_erreur_lors_de_la_suppression', () => {
    // GIVEN
      spyOn(console, 'error');
      component.deletePassword = 'mauvaisMotDePasse';
      
      evenementService.deleteEvenement.and.returnValue(throwError(() => ({ status: 403 })));

    // WHEN
      component.confirmerSuppression();

    // THEN
      expect(evenementService.deleteEvenement).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(component.isDeleting).toBeFalse();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith("Mot de passe administrateur incorrect.", TypeErreurToast.ERROR);
    });

    it('should_close_modal_when_clicking_closedeletemodal', () => {
    // GIVEN
      component.showDeleteModal = true;
      component.deletePassword = 'test';

    // WHEN
      component.closeDeleteModal();

    // THEN
      expect(component.showDeleteModal).toBeFalse();
      expect(component.deletePassword).toBe('');
    });
  });
});
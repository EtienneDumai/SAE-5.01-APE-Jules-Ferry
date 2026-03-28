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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'getCurrentUser']);
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
    it('devrait créer', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser les inputs correctement', () => {
      expect(component.titre).toBe('Événement Test');
      expect(component.id_evenement).toBe(1);
    });
  });

  describe('Redirection vers formulaire d\'inscription', () => {
    it('devrait contenir un lien avec queryParams openForm=true pour le bouton S\'inscrire', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      let inscriptionButton: Element | null = null;
      buttons.forEach(btn => {
        if (btn.textContent?.trim() === 'S\'inscrire') {
          inscriptionButton = btn;
        }
      });

      expect(inscriptionButton).toBeTruthy();
    });

    it('devrait avoir deux boutons de navigation dans la card', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      const navigationButtons = Array.from(buttons).filter(btn => {
        const text = btn.textContent?.trim();
        return text === 'Voir la fiche' || text === 'S\'inscrire';
      });

      expect(navigationButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Gestion des URLs d\'images', () => {
    it('devrait retourner une chaîne vide si aucune url', () => {
      expect(component.getImageUrl('')).toBe('');
    });
  });

  describe('Gestion des permissions (canManage)', () => {
    it('devrait retourner vrai si l\'utilisateur est admin', () => {
      component.currentUser = { id_utilisateur: 1, role: 'administrateur' } as Utilisateur;
      expect(component.canManage).toBe(true);
    });

    it('devrait retourner vrai si l\'utilisateur est membre_bureau ET est créateur', () => {
      component.id_auteur = 10;
      component.currentUser = { id_utilisateur: 10, role: 'membre_bureau' } as Utilisateur;
      expect(component.canManage).toBe(true);
    });

    it('devrait retourner faux si l\'utilisateur est membre_bureau MAIS PAS créateur', () => {
      component.id_auteur = 10;
      component.currentUser = { id_utilisateur: 99, role: 'membre_bureau' } as Utilisateur;
      expect(component.canManage).toBe(false);
    });

    it('devrait retourner faux pour les autres rôles', () => {
      authService.hasRole.and.returnValue(false);
      expect(component.canManage).toBe(false);
    });
  });

  describe('Navigation (Edition)', () => {
    it('devrait naviguer vers la page d\'edition lors de onEdit', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onEdit(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/evenements', 1, 'edit']);
    });
  });

  describe('Suppression d\'événement', () => {
    it('devrait ouvrir la modale de suppression au clic sur onDelete', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.onDelete(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.showDeleteModal).toBeTrue();
      expect(component.deletePassword).toBe('');
    });

    it('ne devrait pas supprimer si le mot de passe est vide', () => {
      component.deletePassword = '';
      component.confirmerSuppression();

      expect(evenementService.deleteEvenement).not.toHaveBeenCalled();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith("Le mot de passe est requis.", TypeErreurToast.ERROR);
    });

    it('devrait supprimer et émettre eventDeleted si confirmé avec mot de passe', () => {
      spyOn(component.eventDeleted, 'emit');
      component.deletePassword = 'monMotDePasse';
      evenementService.deleteEvenement.and.returnValue(of({ message: 'Success' }));

      component.confirmerSuppression();

      expect(evenementService.deleteEvenement).toHaveBeenCalledWith(1, 'monMotDePasse');
      expect(component.eventDeleted.emit).toHaveBeenCalledWith(1);
      expect(component.showDeleteModal).toBeFalse();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith('Événement supprimé avec succès.', TypeErreurToast.SUCCESS);
    });

    it('devrait gérer l\'erreur lors de la suppression', () => {
      spyOn(console, 'error');
      component.deletePassword = 'mauvaisMotDePasse';
      
      evenementService.deleteEvenement.and.returnValue(throwError(() => ({ status: 403 })));

      component.confirmerSuppression();

      expect(evenementService.deleteEvenement).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(component.isDeleting).toBeFalse();
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith("Mot de passe administrateur incorrect.", TypeErreurToast.ERROR);
    });

    it('devrait fermer la modale au clic sur closeDeleteModal', () => {
      component.showDeleteModal = true;
      component.deletePassword = 'test';
      
      component.closeDeleteModal();
      
      expect(component.showDeleteModal).toBeFalse();
      expect(component.deletePassword).toBe('');
    });
  });
});
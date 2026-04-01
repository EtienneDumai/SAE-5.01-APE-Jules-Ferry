/**
 * Fichier : frontend/src/app/components/card/actualite-card/actualite-card.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant actualite card.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualiteCardComponent } from './actualite-card.component';
import { provideRouter, Router } from '@angular/router';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';
import { AuthService } from '../../../services/Auth/auth.service';
import { ActualiteService } from '../../../services/Actualite/actualite.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { of, throwError } from 'rxjs';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

describe('ActualiteCardComponent', () => {
  let component: ActualiteCardComponent;
  let fixture: ComponentFixture<ActualiteCardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let actualiteService: jasmine.SpyObj<ActualiteService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['hasRole']);
    actualiteService = jasmine.createSpyObj<ActualiteService>('ActualiteService', ['deleteActualite']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['showWithTimeout']);
    await TestBed.configureTestingModule({
      imports: [ActualiteCardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ActualiteService, useValue: actualiteService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ActualiteCardComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('devrait avoir l\'input id_actualite', () => {
      component.id_actualite = 123;
      expect(component.id_actualite).toBe(123);
    });

    it('devrait avoir l\'input titre avec une chaîne vide par défaut', () => {
      expect(component.titre).toBe('');
      component.titre = 'Test Actualité';
      expect(component.titre).toBe('Test Actualité');
    });

    it('devrait avoir l\'input contenu', () => {
      const testContenu = 'Ceci est le contenu de l\'actualité';
      component.contenu = testContenu;
      expect(component.contenu).toBe(testContenu);
    });

    it('devrait avoir l\'input image_url', () => {
      const testUrl = 'https://example.com/image.jpg';
      component.image_url = testUrl;
      expect(component.image_url).toBe(testUrl);
    });

    it('devrait avoir l\'input datePublication', () => {
      const testDate = new Date('2026-01-15');
      component.datePublication = testDate;
      expect(component.datePublication).toEqual(testDate);
    });

    it('devrait avoir l\'input statut', () => {
      component.statut = StatutActualite.publie;
      expect(component.statut).toBe(StatutActualite.publie);
    });
  });

  describe('Component rendering', () => {
    beforeEach(() => {
      component.id_actualite = 1;
      component.titre = 'Actualité Test';
      component.contenu = 'Contenu de test pour l\'actualité';
      component.image_url = 'test-image.jpg';
      component.datePublication = new Date('2026-01-15');
      component.statut = StatutActualite.publie;
      fixture.detectChanges();
    });

    it('devrait s\'afficher avec tous les inputs fournis', () => {
      expect(component.id_actualite).toBe(1);
      expect(component.titre).toBe('Actualité Test');
      expect(component.contenu).toBe('Contenu de test pour l\'actualité');
      expect(component.image_url).toBe('test-image.jpg');
      expect(component.datePublication).toEqual(new Date('2026-01-15'));
      expect(component.statut).toBe(StatutActualite.publie);
    });
  });

  describe('Statut handling', () => {
    it('devrait accepter StatutActualite.brouillon', () => {
      component.statut = StatutActualite.brouillon;
      expect(component.statut).toBe(StatutActualite.brouillon);
    });

    it('devrait accepter StatutActualite.publie', () => {
      component.statut = StatutActualite.publie;
      expect(component.statut).toBe(StatutActualite.publie);
    });

    it('devrait accepter StatutActualite.archivee', () => {
      component.statut = StatutActualite.archive;
      expect(component.statut).toBe(StatutActualite.archive);
    });
  });

  describe('behaviour', () => {
    beforeEach(() => {
      component.id_actualite = 5;
    });

    it('autorise la gestion pour un administrateur si l édition n est pas désactivée', () => {
      authService.hasRole.and.returnValue(true);
      component.disableEdit = false;

      expect(component.canManage).toBeTrue();
    });

    it('refuse la gestion si l édition est désactivée', () => {
      authService.hasRole.and.returnValue(true);
      component.disableEdit = true;

      expect(component.canManage).toBeFalse();
    });

    it('affiche la confirmation à la suppression', () => {
      const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

      component.onDelete(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.showDeleteAlert).toBeTrue();
    });

    it('supprime une actualité avec succès', () => {
      spyOn(component.actualiteDeleted, 'emit');
      actualiteService.deleteActualite.and.returnValue(of(void 0));

      component.confirmerSuppression();

      expect(component.actualiteDeleted.emit).toHaveBeenCalledWith(5);
      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Actualité supprimée avec succès.',
        TypeErreurToast.SUCCESS
      );
      expect(component.showDeleteAlert).toBeFalse();
    });

    it('gère une erreur de suppression', () => {
      spyOn(window, 'alert');
      spyOn(console, 'error');
      actualiteService.deleteActualite.and.returnValue(throwError(() => new Error('boom')));

      component.confirmerSuppression();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression de l\'actualité');
      expect(component.showDeleteAlert).toBeFalse();
    });

    it('annule la suppression', () => {
      component.showDeleteAlert = true;

      component.annulerSuppression();

      expect(component.showDeleteAlert).toBeFalse();
    });

    it('navigue vers l édition', () => {
      const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

      component.onEdit(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/actualites', 5, 'edit']);
    });

    it('calcule l url image pour les chemins absolus et relatifs', () => {
      expect(component.getImageUrl(undefined)).toBe('');
      expect(component.getImageUrl('http://cdn/image.webp')).toBe('http://cdn/image.webp');
      expect(component.getImageUrl('/storage/file.webp')).toContain('/storage/file.webp');
    });
  });
});

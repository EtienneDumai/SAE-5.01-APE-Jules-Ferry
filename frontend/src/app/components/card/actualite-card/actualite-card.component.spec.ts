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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should_avoir_input_id_actualite', () => {
    // GIVEN
      component.id_actualite = 123;

    // WHEN

    // THEN
      expect(component.id_actualite).toBe(123);
    });

    it('should_avoir_input_titre_avec_une_chaine_vide_par_defaut', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.titre).toBe('');
      component.titre = 'Test Actualité';
      expect(component.titre).toBe('Test Actualité');
    });

    it('should_avoir_input_contenu', () => {
    // GIVEN
      const testContenu = 'Ceci est le contenu de l\'actualité';
      component.contenu = testContenu;

    // WHEN

    // THEN
      expect(component.contenu).toBe(testContenu);
    });

    it('should_avoir_input_image_url', () => {
    // GIVEN
      const testUrl = 'https://example.com/image.jpg';
      component.image_url = testUrl;

    // WHEN

    // THEN
      expect(component.image_url).toBe(testUrl);
    });

    it('should_avoir_input_datepublication', () => {
    // GIVEN
      const testDate = new Date('2026-01-15');
      component.datePublication = testDate;

    // WHEN

    // THEN
      expect(component.datePublication).toEqual(testDate);
    });

    it('should_avoir_input_statut', () => {
    // GIVEN
      component.statut = StatutActualite.publie;

    // WHEN

    // THEN
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

    it('should_s_afficher_avec_tous_les_inputs_fournis', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.id_actualite).toBe(1);
      expect(component.titre).toBe('Actualité Test');
      expect(component.contenu).toBe('Contenu de test pour l\'actualité');
      expect(component.image_url).toBe('test-image.jpg');
      expect(component.datePublication).toEqual(new Date('2026-01-15'));
      expect(component.statut).toBe(StatutActualite.publie);
    });
  });

  describe('Statut handling', () => {
    it('should_accepter_statutactualite_brouillon', () => {
    // GIVEN
      component.statut = StatutActualite.brouillon;

    // WHEN

    // THEN
      expect(component.statut).toBe(StatutActualite.brouillon);
    });

    it('should_accepter_statutactualite_publie', () => {
    // GIVEN
      component.statut = StatutActualite.publie;

    // WHEN

    // THEN
      expect(component.statut).toBe(StatutActualite.publie);
    });

    it('should_accepter_statutactualite_archivee', () => {
    // GIVEN
      component.statut = StatutActualite.archive;

    // WHEN

    // THEN
      expect(component.statut).toBe(StatutActualite.archive);
    });
  });

  describe('behaviour', () => {
    beforeEach(() => {
      component.id_actualite = 5;
    });

    it('should_allow_gestion_administrator_edition_n_pas_desactivee', () => {
    // GIVEN
      authService.hasRole.and.returnValue(true);
      component.disableEdit = false;

    // WHEN

    // THEN
      expect(component.canManage).toBeTrue();
    });

    it('should_deny_gestion_edition_desactivee', () => {
    // GIVEN
      authService.hasRole.and.returnValue(true);
      component.disableEdit = true;

    // WHEN

    // THEN
      expect(component.canManage).toBeFalse();
    });

    it('should_display_confirmation_suppression', () => {
    // GIVEN
      const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

    // WHEN
      component.onDelete(event);

    // THEN
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.showDeleteAlert).toBeTrue();
    });

    it('should_delete_actualite_success', () => {
    // GIVEN
      spyOn(component.actualiteDeleted, 'emit');
      actualiteService.deleteActualite.and.returnValue(of(void 0));

    // WHEN
      component.confirmerSuppression();

    // THEN
      expect(component.actualiteDeleted.emit).toHaveBeenCalledWith(5);
      expect(toastService.showWithTimeout).toHaveBeenCalledWith(
        'Actualité supprimée avec succès.',
        TypeErreurToast.SUCCESS
      );
      expect(component.showDeleteAlert).toBeFalse();
    });

    it('should_handle_error_suppression', () => {
    // GIVEN
      spyOn(window, 'alert');
      spyOn(console, 'error');
      actualiteService.deleteActualite.and.returnValue(throwError(() => new Error('boom')));

    // WHEN
      component.confirmerSuppression();

    // THEN
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression de l\'actualité');
      expect(component.showDeleteAlert).toBeFalse();
    });

    it('should_annule_suppression', () => {
    // GIVEN
      component.showDeleteAlert = true;

    // WHEN
      component.annulerSuppression();

    // THEN
      expect(component.showDeleteAlert).toBeFalse();
    });

    it('should_navigate_vers_edition', () => {
    // GIVEN
      const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

    // WHEN
      component.onEdit(event);

    // THEN
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/actualites', 5, 'edit']);
    });

    it('should_compute_url_image_chemins_absolus_relatifs', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.getImageUrl(undefined)).toBe('');
      expect(component.getImageUrl('http://cdn/image.webp')).toBe('http://cdn/image.webp');
      expect(component.getImageUrl('/storage/file.webp')).toContain('/storage/file.webp');
    });
  });
});

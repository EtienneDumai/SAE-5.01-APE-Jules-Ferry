/**
 * Fichier : frontend/src/app/pages/actualite-creer/actualite-creer.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page actualite creer.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActualiteCreerComponent } from './actualite-creer.component';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Actualite } from '../../models/Actualite/actualite';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';

describe('ActualiteCreerComponent', () => {
  let component: ActualiteCreerComponent;
  let fixture: ComponentFixture<ActualiteCreerComponent>;
  let actualiteService: jasmine.SpyObj<ActualiteService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let router: Router;
  let location: Location;

  const mockActualite: Actualite = {
    id_actualite: 1,
    titre: 'Test Actualité',
    contenu: 'Contenu de test',
    image_url: 'test.jpg',
    date_publication: new Date('2026-01-20'),
    statut: StatutActualite.publie,
    id_auteur: 1
  };

  beforeEach(async () => {
    const actualiteServiceSpy = jasmine.createSpyObj('ActualiteService', ['createActualite']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout']);

    await TestBed.configureTestingModule({
      imports: [ActualiteCreerComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActualiteService, useValue: actualiteServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    actualiteService = TestBed.inject(ActualiteService) as jasmine.SpyObj<ActualiteService>;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    spyOn(router, 'navigate');
    spyOn(location, 'back');
    
    fixture = TestBed.createComponent(ActualiteCreerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Initialisation du formulaire', () => {
    it('should_initialize_form_with_default_values', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.actualiteForm).toBeTruthy();
      expect(component.actualiteForm.get('titre')?.value).toBe('');
      expect(component.actualiteForm.get('contenu')?.value).toBe('');
      expect(component.actualiteForm.get('date_publication')?.value).toBe('' + new Date().toISOString().split('T')[0]);
      expect(component.actualiteForm.get('statut')?.value).toBe('publie');
      expect(component.actualiteForm.get('image_url')?.value).toBe('');
      expect(component.actualiteForm.get('id_auteur')?.value).toBeDefined();
    });

    it('should_avoir_all_controles_necessaires', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.actualiteForm.contains('titre')).toBe(true);
      expect(component.actualiteForm.contains('contenu')).toBe(true);
      expect(component.actualiteForm.contains('date_publication')).toBe(true);
      expect(component.actualiteForm.contains('statut')).toBe(true);
      expect(component.actualiteForm.contains('image_url')).toBe(true);
    });

    it('should_initialize_loading_false', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.loading).toBe(false);
    });

    it('should_initialize_saving_false', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.saving).toBe(false);
    });
  });

  describe('Validation du formulaire', () => {
    it('should_mark_title_comme_invalid_lorsqu_il_est_vide', () => {
    // GIVEN

    // WHEN
      const titre = component.actualiteForm.get('titre');

    // THEN
      expect(titre?.valid).toBe(false);
      expect(titre?.hasError('required')).toBe(true);
    });

    it('should_mark_title_comme_invalid_s_il_depasse_255_caracteres', () => {
    // GIVEN

    // WHEN
      const titre = component.actualiteForm.get('titre');

      titre?.setValue('a'.repeat(256));

    // THEN
      expect(titre?.valid).toBe(false);
      expect(titre?.hasError('maxlength')).toBe(true);
    });

    it('should_mark_title_comme_valid_value_correcte', () => {
    // GIVEN

    // WHEN
      const titre = component.actualiteForm.get('titre');

      titre?.setValue('Titre valide');

    // THEN
      expect(titre?.valid).toBe(true);
    });

    it('should_mark_contenu_comme_invalid_lorsqu_il_est_vide', () => {
    // GIVEN

    // WHEN
      const contenu = component.actualiteForm.get('contenu');

    // THEN
      expect(contenu?.valid).toBe(false);
      expect(contenu?.hasError('required')).toBe(true);
    });

    it('should_mark_contenu_comme_valid_value', () => {
    // GIVEN

    // WHEN
      const contenu = component.actualiteForm.get('contenu');

      contenu?.setValue('Contenu valide');

    // THEN
      expect(contenu?.valid).toBe(true);
    });

    it('should_mark_date_publication_comme_invalid_lorsqu_elle_est_vide', () => {
    // GIVEN

    // WHEN
      const date = component.actualiteForm.get('date_publication');

      date?.setValue('');

    // THEN
      expect(date?.valid).toBe(false);
      expect(date?.hasError('required')).toBe(true);
    });

    it('should_mark_date_publication_comme_valid_date', () => {
    // GIVEN

    // WHEN
      const date = component.actualiteForm.get('date_publication');

      date?.setValue('2026-01-20');

    // THEN
      expect(date?.valid).toBe(true);
    });

    it('should_mark_statut_comme_invalid_lorsqu_il_est_vide', () => {
    // GIVEN

    // WHEN
      const statut = component.actualiteForm.get('statut');

      statut?.setValue('');

    // THEN
      expect(statut?.valid).toBe(false);
      expect(statut?.hasError('required')).toBe(true);
    });

    it('should_mark_statut_comme_valid_value', () => {
    // GIVEN

    // WHEN
      const statut = component.actualiteForm.get('statut');

      statut?.setValue('PUBLIE');

    // THEN
      expect(statut?.valid).toBe(true);
    });

    it('should_mark_form_comme_invalid_field_requis_empty', () => {
    // GIVEN
      component.actualiteForm.patchValue({
        titre: 'Titre',
        contenu: 'Contenu',
        date_publication: '2026-01-20',
        statut: ''
      });

    // WHEN

    // THEN
      expect(component.actualiteForm.valid).toBe(false);
    });

    it('should_mark_form_comme_valid_lorsque_all_fields_requis_remplis', () => {
    // GIVEN
      component.actualiteForm.patchValue({
        titre: 'Titre',
        contenu: 'Contenu',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

    // WHEN

    // THEN
      expect(component.actualiteForm.valid).toBe(true);
    });
  });

  describe('Gestion des images', () => {
    it('should_accepter_fichier_image_valid', () => {
    // GIVEN
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

    // WHEN
      component.onImageFileChange(event);

    // THEN
      expect(component.selectedImageFile).toBe(file);
      expect(component.imageError).toBeNull();
    });

    it('should_rejeter_fichier_non_image', () => {
    // GIVEN
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

    // WHEN
      component.onImageFileChange(event);

    // THEN
      expect(component.selectedImageFile).toBeNull();
      expect(component.imageError).toBe('Seuls les fichiers images sont autorisés.');
    });

    it('should_reinitialiser_selectedimagefile_no_fichier_n_est_selectionne', () => {
    // GIVEN
      component.selectedImageFile = new File([''], 'test.png', { type: 'image/png' });
      
      const event = {
        target: {
          files: []
        }
      } as unknown as Event;

    // WHEN
      component.onImageFileChange(event);

    // THEN
      expect(component.selectedImageFile).toBeNull();
    });

    it('should_reinitialiser_imageerror_lors_une_nouvelle_selection', () => {
    // GIVEN
      component.imageError = 'Erreur précédente';
      
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

    // WHEN
      component.onImageFileChange(event);

    // THEN
      expect(component.imageError).toBeNull();
    });
  });

  describe('Soumission du formulaire', () => {

    it('should_not_soumettre_form_invalid', () => {
    // GIVEN
      component.actualiteForm.patchValue({
        titre: '',
        contenu: '',
        date_publication: '',
        statut: ''
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(actualiteService.createActualite).not.toHaveBeenCalled();
      expect(component.saving).toBe(false);
    });

    it('should_mark_all_fields_comme_touches_form_invalid', () => {
    // GIVEN
      component.actualiteForm.patchValue({
        titre: '',
        contenu: '',
        date_publication: '',
        statut: ''
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(component.actualiteForm.get('titre')?.touched).toBe(true);
      expect(component.actualiteForm.get('contenu')?.touched).toBe(true);
      expect(component.actualiteForm.get('date_publication')?.touched).toBe(true);
      expect(component.actualiteForm.get('statut')?.touched).toBe(true);
    });

    it('should_create_actualite_success', fakeAsync(() => {
    // GIVEN
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(actualiteService.createActualite).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/actualites']);
    }));

    it('should_definir_saving_true_pendant_soumission', fakeAsync(() => {
    // GIVEN
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

    // WHEN
      component.onSubmit();

    // THEN
      expect(component.saving).toBe(true);
      tick();
    }));

    it('should_inclure_image_dans_le_formdata_si_elle_est_selectionnee', fakeAsync(() => {
    // GIVEN
      actualiteService.createActualite.and.returnValue(of(mockActualite));
      
      const file = new File([''], 'test.png', { type: 'image/png' });
      component.selectedImageFile = file;

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(actualiteService.createActualite).toHaveBeenCalled();
      const formData = actualiteService.createActualite.calls.mostRecent().args[0] as FormData;
      expect(formData.get('image')).toBe(file);
    }));

    it('should_handle_errors_when_creation', fakeAsync(() => {
    // GIVEN
      const error = { message: 'Erreur serveur' };
      actualiteService.createActualite.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

    // WHEN
      component.onSubmit();

      tick();

    // THEN
      expect(console.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde de l\'actualité:', error);
      expect(toastServiceSpy.show).toHaveBeenCalledWith('Erreur lors de la création de l\'actualité. Veuillez réessayer.', TypeErreurToast.ERROR);
      expect(component.saving).toBe(false);
    }));

    it('should_not_add_values_null_vides_formdata', fakeAsync(() => {
    // GIVEN
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        image_url: '',
        id_auteur: 1
      });

    // WHEN
      component.onSubmit();

      tick();

      const formData = actualiteService.createActualite.calls.mostRecent().args[0] as FormData;

    // THEN
      expect(formData.get('image_url')).toBeNull();
    }));
  });

  describe('Navigation', () => {
    it('should_call_location_back_lors_clic_goback', () => {
    // GIVEN

    // WHEN
      component.goBack();

    // THEN
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('États du composant', () => {
    it('should_avoir_imageerror_null_par_default', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.imageError).toBeNull();
    });

    it('should_avoir_selectedimagefile_null_par_default', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.selectedImageFile).toBeNull();
    });
  });
});
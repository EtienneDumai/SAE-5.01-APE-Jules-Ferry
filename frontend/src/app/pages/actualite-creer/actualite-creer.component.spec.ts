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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation du formulaire', () => {
    it('devrait initialiser le formulaire avec des valeurs par défaut', () => {
      expect(component.actualiteForm).toBeTruthy();
      expect(component.actualiteForm.get('titre')?.value).toBe('');
      expect(component.actualiteForm.get('contenu')?.value).toBe('');
      expect(component.actualiteForm.get('date_publication')?.value).toBe('' + new Date().toISOString().split('T')[0]);
      expect(component.actualiteForm.get('statut')?.value).toBe('publie');
      expect(component.actualiteForm.get('image_url')?.value).toBe('');
      expect(component.actualiteForm.get('id_auteur')?.value).toBeDefined();
    });

    it('devrait avoir tous les contrôles nécessaires', () => {
      expect(component.actualiteForm.contains('titre')).toBe(true);
      expect(component.actualiteForm.contains('contenu')).toBe(true);
      expect(component.actualiteForm.contains('date_publication')).toBe(true);
      expect(component.actualiteForm.contains('statut')).toBe(true);
      expect(component.actualiteForm.contains('image_url')).toBe(true);
    });

    it('devrait initialiser loading à false', () => {
      expect(component.loading).toBe(false);
    });

    it('devrait initialiser saving à false', () => {
      expect(component.saving).toBe(false);
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait marquer titre comme invalide lorsqu\'il est vide', () => {
      const titre = component.actualiteForm.get('titre');
      expect(titre?.valid).toBe(false);
      expect(titre?.hasError('required')).toBe(true);
    });

    it('devrait marquer titre comme invalide s\'il dépasse 255 caractères', () => {
      const titre = component.actualiteForm.get('titre');
      titre?.setValue('a'.repeat(256));
      expect(titre?.valid).toBe(false);
      expect(titre?.hasError('maxlength')).toBe(true);
    });

    it('devrait marquer titre comme valide avec une valeur correcte', () => {
      const titre = component.actualiteForm.get('titre');
      titre?.setValue('Titre valide');
      expect(titre?.valid).toBe(true);
    });

    it('devrait marquer contenu comme invalide lorsqu\'il est vide', () => {
      const contenu = component.actualiteForm.get('contenu');
      expect(contenu?.valid).toBe(false);
      expect(contenu?.hasError('required')).toBe(true);
    });

    it('devrait marquer contenu comme valide avec une valeur', () => {
      const contenu = component.actualiteForm.get('contenu');
      contenu?.setValue('Contenu valide');
      expect(contenu?.valid).toBe(true);
    });

    it('devrait marquer date_publication comme invalide lorsqu\'elle est vide', () => {
      const date = component.actualiteForm.get('date_publication');
      date?.setValue('');
      expect(date?.valid).toBe(false);
      expect(date?.hasError('required')).toBe(true);
    });

    it('devrait marquer date_publication comme valide avec une date', () => {
      const date = component.actualiteForm.get('date_publication');
      date?.setValue('2026-01-20');
      expect(date?.valid).toBe(true);
    });

    it('devrait marquer statut comme invalide lorsqu\'il est vide', () => {
      const statut = component.actualiteForm.get('statut');
      statut?.setValue('');
      expect(statut?.valid).toBe(false);
      expect(statut?.hasError('required')).toBe(true);
    });

    it('devrait marquer statut comme valide avec une valeur', () => {
      const statut = component.actualiteForm.get('statut');
      statut?.setValue('PUBLIE');
      expect(statut?.valid).toBe(true);
    });

    it('devrait marquer le formulaire comme invalide si un champ requis est vide', () => {
      component.actualiteForm.patchValue({
        titre: 'Titre',
        contenu: 'Contenu',
        date_publication: '2026-01-20',
        statut: ''
      });
      expect(component.actualiteForm.valid).toBe(false);
    });

    it('devrait marquer le formulaire comme valide lorsque tous les champs requis sont remplis', () => {
      component.actualiteForm.patchValue({
        titre: 'Titre',
        contenu: 'Contenu',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });
      expect(component.actualiteForm.valid).toBe(true);
    });
  });

  describe('Gestion des images', () => {
    it('devrait accepter un fichier image valide', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      component.onImageFileChange(event);

      expect(component.selectedImageFile).toBe(file);
      expect(component.imageError).toBeNull();
    });

    it('devrait rejeter un fichier non-image', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      component.onImageFileChange(event);

      expect(component.selectedImageFile).toBeNull();
      expect(component.imageError).toBe('Seuls les fichiers images sont autorisés.');
    });

    it('devrait réinitialiser selectedImageFile si aucun fichier n\'est sélectionné', () => {
      component.selectedImageFile = new File([''], 'test.png', { type: 'image/png' });
      
      const event = {
        target: {
          files: []
        }
      } as unknown as Event;

      component.onImageFileChange(event);

      expect(component.selectedImageFile).toBeNull();
    });

    it('devrait réinitialiser imageError lors d\'une nouvelle sélection', () => {
      component.imageError = 'Erreur précédente';
      
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      component.onImageFileChange(event);

      expect(component.imageError).toBeNull();
    });
  });

  describe('Soumission du formulaire', () => {

    it('ne devrait pas soumettre si le formulaire est invalide', () => {
      component.actualiteForm.patchValue({
        titre: '',
        contenu: '',
        date_publication: '',
        statut: ''
      });

      component.onSubmit();

      expect(actualiteService.createActualite).not.toHaveBeenCalled();
      expect(component.saving).toBe(false);
    });

    it('devrait marquer tous les champs comme touchés si le formulaire est invalide', () => {
      component.actualiteForm.patchValue({
        titre: '',
        contenu: '',
        date_publication: '',
        statut: ''
      });

      component.onSubmit();

      expect(component.actualiteForm.get('titre')?.touched).toBe(true);
      expect(component.actualiteForm.get('contenu')?.touched).toBe(true);
      expect(component.actualiteForm.get('date_publication')?.touched).toBe(true);
      expect(component.actualiteForm.get('statut')?.touched).toBe(true);
    });

    it('devrait créer une actualité avec succès', fakeAsync(() => {
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

      component.onSubmit();
      tick();

      expect(actualiteService.createActualite).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/actualites']);
    }));

    it('devrait définir saving à true pendant la soumission', fakeAsync(() => {
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        id_auteur: 1
      });

      component.onSubmit();

      expect(component.saving).toBe(true);
      tick();
    }));

    it('devrait inclure l\'image dans le FormData si elle est sélectionnée', fakeAsync(() => {
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

      component.onSubmit();
      tick();

      expect(actualiteService.createActualite).toHaveBeenCalled();
      const formData = actualiteService.createActualite.calls.mostRecent().args[0] as FormData;
      expect(formData.get('image')).toBe(file);
    }));

    it('devrait gérer les erreurs lors de la création', fakeAsync(() => {
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

      component.onSubmit();
      tick();

      expect(console.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde de l\'actualité:', error);
      expect(toastServiceSpy.show).toHaveBeenCalledWith('Erreur lors de la création de l\'actualité. Veuillez réessayer.', TypeErreurToast.ERROR);
      expect(component.saving).toBe(false);
    }));

    it('ne devrait pas ajouter de valeurs null ou vides au FormData', fakeAsync(() => {
      actualiteService.createActualite.and.returnValue(of(mockActualite));

      component.actualiteForm.patchValue({
        titre: 'Test Actualité',
        contenu: 'Contenu de test',
        date_publication: '2026-01-20',
        statut: 'publie',
        image_url: '',
        id_auteur: 1
      });

      component.onSubmit();
      tick();

      const formData = actualiteService.createActualite.calls.mostRecent().args[0] as FormData;
      expect(formData.get('image_url')).toBeNull();
    }));
  });

  describe('Navigation', () => {
    it('devrait appeler location.back() lors du clic sur goBack', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('États du composant', () => {
    it('devrait avoir imageError à null par défaut', () => {
      expect(component.imageError).toBeNull();
    });

    it('devrait avoir selectedImageFile à null par défaut', () => {
      expect(component.selectedImageFile).toBeNull();
    });
  });
});
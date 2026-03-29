/**
 * Fichier : frontend/src/app/pages/actualite-detail/actualite-detail.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page actualite detail.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualiteDetailComponent } from './actualite-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { Actualite } from '../../models/Actualite/actualite';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { By } from '@angular/platform-browser';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';

describe('ActualiteDetailComponent', () => {
  let component: ActualiteDetailComponent;
  let fixture: ComponentFixture<ActualiteDetailComponent>;
  let actualiteServiceSpy: jasmine.SpyObj<ActualiteService>;
  let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
  let locationSpy: jasmine.SpyObj<Location>;

  const mockActualite: Actualite = {
    id_actualite: 123,
    titre: 'Titre Test',
    contenu: 'Contenu Test',
    image_url: 'img.jpg',
    date_publication: new Date('2024-01-01'),
    statut: StatutActualite.publie,
    id_auteur: 456
  };

  const mockAuteur: Utilisateur = {
    id_utilisateur: 456,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: RoleUtilisateur.administrateur,
    statut_compte: StatutCompte.actif
  };

  beforeEach(async () => {
    actualiteServiceSpy = jasmine.createSpyObj('ActualiteService', ['getActualiteById']);
    utilisateurServiceSpy = jasmine.createSpyObj('UtilisateurService', ['getUtilisateurById']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    actualiteServiceSpy.getActualiteById.and.returnValue(of(mockActualite));
    utilisateurServiceSpy.getUtilisateurById.and.returnValue(of(mockAuteur));

    await TestBed.configureTestingModule({
      imports: [ActualiteDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
          }
        },
        { provide: ActualiteService, useValue: actualiteServiceSpy },
        { provide: UtilisateurService, useValue: utilisateurServiceSpy },
        { provide: Location, useValue: locationSpy }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualiteDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('devrait charger l\'actualité et l\'auteur à l\'initialisation', () => {
      fixture.detectChanges();

      expect(actualiteServiceSpy.getActualiteById).toHaveBeenCalledWith(123);
      expect(utilisateurServiceSpy.getUtilisateurById).toHaveBeenCalledWith(456);
      expect(component.actualite).toEqual(mockActualite);
      expect(component.auteur).toEqual(mockAuteur);
      expect(component.loadingActualite).toBeFalse();
      expect(component.errorActualite).toBeFalse();
      expect(component.errorAuteur).toBeFalse();
    });

    it('devrait gérer une erreur lors du chargement de l\'actualité', () => {
      const error = new Error('Erreur API Actualité');
      actualiteServiceSpy.getActualiteById.and.returnValue(throwError(() => error));
      
      spyOn(console, 'error');
      fixture.detectChanges();

      expect(component.loadingActualite).toBeFalse();
      expect(component.errorActualite).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
      expect(utilisateurServiceSpy.getUtilisateurById).not.toHaveBeenCalled();
    });

    it('devrait gérer une erreur lors du chargement de l\'auteur', () => {
      const error = new Error('Erreur API Auteur');
      actualiteServiceSpy.getActualiteById.and.returnValue(of(mockActualite));
      utilisateurServiceSpy.getUtilisateurById.and.returnValue(throwError(() => error));

      spyOn(console, 'error');
      fixture.detectChanges();

      expect(component.loadingActualite).toBeFalse();
      expect(component.errorActualite).toBeFalse();
      expect(component.errorAuteur).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('Affichage', () => {
    it('devrait afficher le spinner pendant le chargement', () => {
      fixture.detectChanges();
      component.loadingActualite = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.directive(SpinnerComponent));
      expect(spinner).toBeTruthy();
    });

    it('devrait afficher le contenu de l\'actualité une fois chargée', () => {
      fixture.detectChanges();
      const componentText = fixture.nativeElement.textContent;
      
      expect(componentText).toContain(mockActualite.titre);
      expect(componentText).toContain(mockActualite.contenu);
    });

    it('devrait afficher le nom de l\'auteur', () => {
      fixture.detectChanges();
      const auteurInfo = fixture.nativeElement.textContent;
      expect(auteurInfo).toContain('Doe John');
    });

    it('devrait afficher un message d\'erreur pour l\'auteur si le chargement échoue', () => {
      utilisateurServiceSpy.getUtilisateurById.and.returnValue(throwError(() => new Error('Oups')));
      spyOn(console, 'error');
      fixture.detectChanges();
      
      const componentText = fixture.nativeElement.textContent;
      expect(componentText).toContain('Auteur inconnu');
    });
  });

  describe('Navigation', () => {
    it('devrait appeler location.back() lors du clic sur le bouton retour', () => {
      fixture.detectChanges();
      const backButton = fixture.debugElement.query(By.css('button'));
      backButton.triggerEventHandler('click', null);
      
      expect(locationSpy.back).toHaveBeenCalled();
    });
  });

  describe('Méthodes utilitaires', () => {
    it('convertDateToString devrait retourner une date formatée', () => {
        fixture.detectChanges();
        const date = new Date('2024-12-25');
        const formatted = component.convertDateToString(date);
        expect(formatted).toBe('25/12/2024');
    });
  });
});
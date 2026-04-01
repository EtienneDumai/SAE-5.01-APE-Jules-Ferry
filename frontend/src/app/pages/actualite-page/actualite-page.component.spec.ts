/**
 * Fichier : frontend/src/app/pages/actualite-page/actualite-page.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page actualite page.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualitePageComponent } from './actualite-page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { AuthService } from '../../services/Auth/auth.service';
import { of, throwError } from 'rxjs';
import { Actualite } from '../../models/Actualite/actualite';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { By } from '@angular/platform-browser';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ActualiteCardComponent } from '../../components/card/actualite-card/actualite-card.component';

describe('ActualitePageComponent', () => {
  let component: ActualitePageComponent;
  let fixture: ComponentFixture<ActualitePageComponent>;
  let actualiteServiceSpy: jasmine.SpyObj<ActualiteService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: Router;

  const mockActualites: Actualite[] = [
    {
      id_actualite: 1,
      titre: 'Old News',
      contenu: 'Content 1',
      image_url: 'img1.jpg',
      date_publication: new Date('2024-01-01'),
      statut: StatutActualite.publie,
      id_auteur: 1
    },
    {
      id_actualite: 2,
      titre: 'Recent News',
      contenu: 'Content 2',
      image_url: 'img2.jpg',
      date_publication: new Date('2024-02-01'),
      statut: StatutActualite.publie,
      id_auteur: 1
    }
  ];

  beforeEach(async () => {
    actualiteServiceSpy = jasmine.createSpyObj('ActualiteService', ['getAllActualites']);
    actualiteServiceSpy.getAllActualites.and.returnValue(of(mockActualites));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    authServiceSpy.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ActualitePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActualiteService, useValue: actualiteServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualitePageComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
  });

  it('should_create', () => {
  // GIVEN

  // WHEN
    fixture.detectChanges();

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Initialisation et Chargement', () => {
    it('should_load_trier_actualites_par_date_decroissante_startup', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(actualiteServiceSpy.getAllActualites).toHaveBeenCalled();
      expect(component.loadingActualites).toBeFalse();
      expect(component.errorActualites).toBeFalse();
      expect(component.listeActualites.length).toBe(2);
      expect(component.listeActualites[0].id_actualite).toBe(2);
      expect(component.listeActualites[1].id_actualite).toBe(1);
    });

    it('should_handle_error_lors_chargement_actualites', () => {
    // GIVEN
      const error = new Error('Erreur API');
      actualiteServiceSpy.getAllActualites.and.returnValue(throwError(() => error));
      
      spyOn(console, 'error');

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(component.loadingActualites).toBeFalse();
      expect(component.errorActualites).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
      expect(component.listeActualites).toEqual([]);
    });
  });

  describe('Affichage (Template)', () => {
    it('should_display_spinner_pendant_chargement', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();
      component.loadingActualites = true;

      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.directive(SpinnerComponent));

    // THEN
      expect(spinner).toBeTruthy();
    });

    it('should_display_message_erreur_si_le_chargement_echoue', () => {
    // GIVEN
      spyOn(console, 'error');
      actualiteServiceSpy.getAllActualites.and.returnValue(throwError(() => new Error('Oups')));

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(fixture.nativeElement.textContent).toContain('Erreur');
    });

    it('should_display_message_no_actualite_n_est_disponible', () => {
    // GIVEN
      actualiteServiceSpy.getAllActualites.and.returnValue(of([]));

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(fixture.nativeElement.textContent).toContain('Aucune actualité');
    });

    it('should_display_liste_cartes_actualite_quand_les_donnees_sont_la', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(ActualiteCardComponent));

    // THEN
      expect(cards.length).toBe(2);
      const firstCardInstance = cards[0].componentInstance as ActualiteCardComponent;
      expect(firstCardInstance.titre).toBe('Recent News');
    });

    it('should_avoir_lien_retour_vers_accueil', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();
      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const homeLink = elements.find(el => el.nativeElement.getAttribute('ng-reflect-router-link') === '/');

    // THEN
      expect(homeLink).toBeTruthy();
    });
  });

  describe('Bouton de création d\'actualité', () => {
    
    it('should_not_display_bouton_create_non_admins', () => {
    // GIVEN
      authServiceSpy.hasRole.and.returnValue(false);

    // WHEN
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));

    // THEN
      expect(createButton).toBeUndefined();
    });

    it('should_display_bouton_create_administrateurs', () => {
    // GIVEN
      authServiceSpy.hasRole.and.returnValue(true);

    // WHEN
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));

    // THEN
      expect(createButton).toBeTruthy();
    });

    it('should_avoir_bon_routerlink_bouton_creation', () => {
    // GIVEN
      authServiceSpy.hasRole.and.returnValue(true);

    // WHEN
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));
      
      if (createButton) {
        const routerLinkAttr = createButton.nativeElement.getAttribute('ng-reflect-router-link');

    // THEN
        expect(routerLinkAttr).toBe('/actualites/creer');
      }
    });

    it('should_call_hasrole_administrator', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(authServiceSpy.hasRole).toHaveBeenCalledWith('administrateur');
    });
  });
});
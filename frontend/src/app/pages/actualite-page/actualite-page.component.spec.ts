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

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialisation et Chargement', () => {
    it('devrait charger et trier les actualités par date décroissante au démarrage', () => {
      fixture.detectChanges();

      expect(actualiteServiceSpy.getAllActualites).toHaveBeenCalled();
      expect(component.loadingActualites).toBeFalse();
      expect(component.errorActualites).toBeFalse();
      expect(component.listeActualites.length).toBe(2);
      expect(component.listeActualites[0].id_actualite).toBe(2);
      expect(component.listeActualites[1].id_actualite).toBe(1);
    });

    it('devrait gérer une erreur lors du chargement des actualités', () => {
      const error = new Error('Erreur API');
      actualiteServiceSpy.getAllActualites.and.returnValue(throwError(() => error));
      
      spyOn(console, 'error');
      fixture.detectChanges();

      expect(component.loadingActualites).toBeFalse();
      expect(component.errorActualites).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
      expect(component.listeActualites).toBeUndefined();
    });
  });

  describe('Affichage (Template)', () => {
    it('devrait afficher le spinner pendant le chargement', () => {
      fixture.detectChanges();
      component.loadingActualites = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.directive(SpinnerComponent));
      expect(spinner).toBeTruthy();
    });

    it('devrait afficher un message d\'erreur si le chargement échoue', () => {
      actualiteServiceSpy.getAllActualites.and.returnValue(throwError(() => new Error('Oups')));
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Erreur');
    });

    it('devrait afficher un message si aucune actualité n\'est disponible', () => {
      actualiteServiceSpy.getAllActualites.and.returnValue(of([]));
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Aucune actualité');
    });

    it('devrait afficher la liste des cartes d\'actualité quand les données sont là', () => {
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(ActualiteCardComponent));
      expect(cards.length).toBe(2);
      const firstCardInstance = cards[0].componentInstance as ActualiteCardComponent;
      expect(firstCardInstance.titre).toBe('Recent News');
    });

    it('devrait avoir un lien de retour vers l\'accueil', () => {
      fixture.detectChanges();
      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const homeLink = elements.find(el => el.nativeElement.getAttribute('ng-reflect-router-link') === '/');
      expect(homeLink).toBeTruthy();
    });
  });

  describe('Bouton de création d\'actualité', () => {
    
    it('ne devrait pas afficher le bouton "Créer" pour les non-admins', () => {
      authServiceSpy.hasRole.and.returnValue(false);
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));
      expect(createButton).toBeUndefined();
    });

    it('devrait afficher le bouton "Créer" pour les administrateurs', () => {
      authServiceSpy.hasRole.and.returnValue(true);
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));
      expect(createButton).toBeTruthy();
    });

    it('devrait avoir le bon routerLink pour le bouton de création', () => {
      authServiceSpy.hasRole.and.returnValue(true);
      fixture.detectChanges();

      const elements = fixture.debugElement.queryAll(By.css('button, a'));
      const createButton = elements.find(el => el.nativeElement.textContent.includes('Créer'));
      
      if (createButton) {
        const routerLinkAttr = createButton.nativeElement.getAttribute('ng-reflect-router-link');
        expect(routerLinkAttr).toBe('/actualites/creer');
      }
    });

    it('devrait appeler hasRole avec "administrateur"', () => {
      fixture.detectChanges();
      expect(authServiceSpy.hasRole).toHaveBeenCalledWith('administrateur');
    });
  });
});
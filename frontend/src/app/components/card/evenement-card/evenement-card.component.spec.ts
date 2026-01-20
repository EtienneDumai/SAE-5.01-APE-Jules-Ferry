import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvenementCardComponent } from './evenement-card.component';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { AuthService } from '../../../services/Auth/auth.service';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { of, throwError } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('EvenementCardComponent', () => {
  let component: EvenementCardComponent;
  let fixture: ComponentFixture<EvenementCardComponent>;
  
  // Services mockés
  let authService: jasmine.SpyObj<AuthService>;
  let evenementService: jasmine.SpyObj<EvenementService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Mocks des services
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'getCurrentUser']);
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['deleteEvenement']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    routerSpy.createUrlTree.and.returnValue({} as UrlTree); 
    routerSpy.serializeUrl.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [EvenementCardComponent, DatePipe],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: Router, useValue: routerSpy },
        { 
          provide: ActivatedRoute, 
          useValue: { snapshot: { paramMap: { get: () => null } } } 
        }
      ]
    }).compileComponents();

    // Injection des services
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    evenementService = TestBed.inject(EvenementService) as jasmine.SpyObj<EvenementService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(EvenementCardComponent);
    component = fixture.componentInstance;

    // Initialisation des inputs
    component.id_evenement = 1;
    component.titre = 'Événement Test';
    component.description = 'Description Test';
    component.date_evenement = new Date();
    component.heure_debut = '10:00';
    component.heure_fin = '12:00';
    component.lieu = 'Salle Test';
    component.statut = StatutEvenement.publie;
    component.image_url = 'test.jpg';
    
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

  describe('Gestion des URLs d\'images', () => {
    it('devrait retourner une chaîne vide si aucune url', () => {
      expect(component.getImageUrl('')).toBe('');
    });

    it('devrait retourner l\'url originale si elle commence par http', () => {
      const url = 'http://example.com/image.jpg';
      expect(component.getImageUrl(url)).toBe(url);
    });

    it('devrait préfixer localhost si l\'url est relative', () => {
      const url = '/uploads/image.jpg';
      expect(component.getImageUrl(url)).toBe('http://localhost:8000/uploads/image.jpg');
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
    it('ne devrait pas supprimer si l\'utilisateur annule la confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const event = new Event('click');
      
      component.onDelete(event);

      expect(evenementService.deleteEvenement).not.toHaveBeenCalled();
    });

    it('devrait supprimer et émettre eventDeleted si confirmé', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      spyOn(component.eventDeleted, 'emit');

      evenementService.deleteEvenement.and.returnValue(of(void 0));

      component.onDelete(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(evenementService.deleteEvenement).toHaveBeenCalledWith(1);
      expect(component.eventDeleted.emit).toHaveBeenCalledWith(1);
    });

    it('devrait gérer l\'erreur lors de la suppression', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');
      const event = new Event('click');
      
      evenementService.deleteEvenement.and.returnValue(throwError(() => new Error('Erreur API')));

      component.onDelete(event);

      expect(evenementService.deleteEvenement).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
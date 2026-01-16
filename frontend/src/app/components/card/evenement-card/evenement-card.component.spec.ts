import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvenementCardComponent } from './evenement-card.component';
import { Router, ActivatedRoute, UrlTree } from '@angular/router'; // Ajout des imports
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { AuthService } from '../../../services/Auth/auth.service';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { RoleUtilisateur } from '../../../enums/RoleUtilisateur/role-utilisateur';
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
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize inputs correctly', () => {
      expect(component.titre).toBe('Événement Test');
      expect(component.id_evenement).toBe(1);
    });
  });

  describe('Gestion des URLs d\'images', () => {
    it('should return empty string if no url', () => {
      expect(component.getImageUrl('')).toBe('');
    });

    it('should return original url if it starts with http', () => {
      const url = 'http://example.com/image.jpg';
      expect(component.getImageUrl(url)).toBe(url);
    });

    it('should prepend localhost if url is relative', () => {
      const url = '/uploads/image.jpg';
      expect(component.getImageUrl(url)).toBe('http://localhost:8000/uploads/image.jpg');
    });
  });

  describe('Gestion des permissions (canManage)', () => {
    it('should return true if user is admin', () => {
      authService.hasRole.and.callFake(role => role === RoleUtilisateur.administrateur);
      expect(component.canManage).toBe(true);
    });

    it('should return true if user is membre_bureau AND is creator', () => {
      component.id_createur = 10;
      authService.hasRole.and.callFake(role => role === RoleUtilisateur.membre_bureau);
      authService.getCurrentUser.and.returnValue({ id_utilisateur: 10 } as any);

      expect(component.canManage).toBe(true);
    });

    it('should return false if user is membre_bureau BUT NOT creator', () => {
      component.id_createur = 10;
      authService.hasRole.and.callFake(role => role === RoleUtilisateur.membre_bureau);
      authService.getCurrentUser.and.returnValue({ id_utilisateur: 99 } as any);

      expect(component.canManage).toBe(false);
    });

    it('should return false for other roles', () => {
      authService.hasRole.and.returnValue(false);
      expect(component.canManage).toBe(false);
    });
  });

  describe('Navigation (Edition)', () => {
    it('should navigate to edit page onEdit', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      
      component.onEdit(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/evenements', 1, 'edit']);
    });
  });

  describe('Suppression d\'événement', () => {
    it('should not delete if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const event = new Event('click');
      
      component.onDelete(event);

      expect(evenementService.deleteEvenement).not.toHaveBeenCalled();
    });

    it('should delete and emit eventDeleted if confirmed', () => {
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

    it('should handle error during deletion', () => {
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
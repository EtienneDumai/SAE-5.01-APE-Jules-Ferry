import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<Utilisateur | null>;

  const mockUser: Utilisateur = {
    id: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: RoleUtilisateur.parent,
  } as unknown as Utilisateur;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('devrait initialiser sans utilisateur et isAuthenticated à faux', () => {
      fixture.detectChanges();
      expect(component.currentUser).toBeNull();
      expect(component.isAuthenticated).toBeFalse();
    });

    it('devrait définir currentUser et isAuthenticated quand un utilisateur est connecté', () => {
      currentUserSubject.next(mockUser);
      fixture.detectChanges();
      
      expect(component.currentUser).toEqual(mockUser);
      expect(component.isAuthenticated).toBeTrue();
    });

    it('devrait mettre à jour currentUser quand il change', () => {
      fixture.detectChanges();
      expect(component.currentUser).toBeNull();
      
      currentUserSubject.next(mockUser);
      expect(component.currentUser).toEqual(mockUser);
      expect(component.isAuthenticated).toBeTrue();
      
      currentUserSubject.next(null);
      expect(component.currentUser).toBeNull();
      expect(component.isAuthenticated).toBeFalse();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('devrait appeler authService.logout quand l\'utilisateur confirme', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      authService.logout.and.returnValue(of(undefined));
      spyOn(console, 'log');

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('Voulez-vous vraiment vous déconnecter ?');
      expect(authService.logout).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Déconnexion réussie');
    });

    it('ne devrait pas appeler authService.logout quand l\'utilisateur annule', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('Voulez-vous vraiment vous déconnecter ?');
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('devrait gérer l\'erreur de déconnexion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = { message: 'Logout failed' };
      authService.logout.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erreur lors de la déconnexion', error);
    });
  });

  describe('toggleMenu', () => {
    it('devrait basculer menuOpen de faux à vrai', () => {
      component.menuOpen = false;
      component.toggleMenu();
      expect(component.menuOpen).toBeTrue();
    });

    it('devrait basculer menuOpen de vrai à faux', () => {
      component.menuOpen = true;
      component.toggleMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('closeMenu', () => {
    it('devrait définir menuOpen à faux', () => {
      component.menuOpen = true;
      component.closeMenu();
      expect(component.menuOpen).toBeFalse();
    });

    it('devrait garder menuOpen à faux s\'il est déjà faux', () => {
      component.menuOpen = false;
      component.closeMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('onEsc', () => {
    it('devrait fermer le menu quand la touche échap est pressée', () => {
      component.menuOpen = true;
      component.onEsc();
      expect(component.menuOpen).toBeFalse();
    });

    it('devrait être déclenché par l\'appui sur la touche échap', () => {
      fixture.detectChanges();
      component.menuOpen = true;
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('roleUtilisateur', () => {
    it('devrait avoir la propriété roleUtilisateur définie sur l\'enum RoleUtilisateur', () => {
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });
});

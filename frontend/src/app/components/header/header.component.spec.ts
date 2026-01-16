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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize with no user and isAuthenticated false', () => {
      fixture.detectChanges();
      expect(component.currentUser).toBeNull();
      expect(component.isAuthenticated).toBeFalse();
    });

    it('should set currentUser and isAuthenticated when user is logged in', () => {
      currentUserSubject.next(mockUser);
      fixture.detectChanges();
      
      expect(component.currentUser).toEqual(mockUser);
      expect(component.isAuthenticated).toBeTrue();
    });

    it('should update currentUser when it changes', () => {
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

    it('should call authService.logout when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      authService.logout.and.returnValue(of(undefined));
      spyOn(console, 'log');

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('Voulez-vous vraiment vous déconnecter ?');
      expect(authService.logout).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Déconnexion réussie');
    });

    it('should not call authService.logout when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('Voulez-vous vraiment vous déconnecter ?');
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should handle logout error', () => {
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
    it('should toggle menuOpen from false to true', () => {
      component.menuOpen = false;
      component.toggleMenu();
      expect(component.menuOpen).toBeTrue();
    });

    it('should toggle menuOpen from true to false', () => {
      component.menuOpen = true;
      component.toggleMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('closeMenu', () => {
    it('should set menuOpen to false', () => {
      component.menuOpen = true;
      component.closeMenu();
      expect(component.menuOpen).toBeFalse();
    });

    it('should keep menuOpen false if already false', () => {
      component.menuOpen = false;
      component.closeMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('onEsc', () => {
    it('should close menu when escape key is pressed', () => {
      component.menuOpen = true;
      component.onEsc();
      expect(component.menuOpen).toBeFalse();
    });

    it('should be triggered by escape key event', () => {
      fixture.detectChanges();
      component.menuOpen = true;
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('roleUtilisateur', () => {
    it('should have roleUtilisateur property set to RoleUtilisateur enum', () => {
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });
});

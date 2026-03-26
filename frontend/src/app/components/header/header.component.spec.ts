import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<Utilisateur | null>;

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('Gestion de la déconnexion avec modale', () => {
    it('devrait afficher la modale quand on déclenche la déconnexion', () => {
      component.showLogoutModal = false;
      component.declencherLogout();
      expect(component.showLogoutModal).toBeTrue();
    });

    it('devrait appeler authService.logout quand on confirme via la modale', () => {
      authService.logout.and.returnValue(of(undefined));
      component.showLogoutModal = true;

      component.confirmerLogout();

      expect(authService.logout).toHaveBeenCalled();
      expect(component.showLogoutModal).toBeFalse();
    });

    it('devrait masquer la modale et logguer l\'erreur si le logout échoue', () => {
      const error = { message: 'Erreur' };
      authService.logout.and.returnValue(throwError(() => error));
      spyOn(console, 'error');
      
      component.confirmerLogout();

      expect(console.error).toHaveBeenCalled();
      expect(component.showLogoutModal).toBeFalse();
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

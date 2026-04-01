/**
 * Fichier : frontend/src/app/components/header/header.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant header.
 */

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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Gestion de la déconnexion avec modale', () => {
    it('should_display_modal_when_declenche_logout', () => {
    // GIVEN
      component.showLogoutModal = false;

    // WHEN
      component.declencherLogout();

    // THEN
      expect(component.showLogoutModal).toBeTrue();
    });

    it('should_call_authservice_logout_when_confirme_modal', () => {
    // GIVEN
      authService.logout.and.returnValue(of(undefined));
      component.showLogoutModal = true;

    // WHEN
      component.confirmerLogout();

    // THEN
      expect(authService.logout).toHaveBeenCalled();
      expect(component.showLogoutModal).toBeFalse();
    });

    it('should_masquer_modal_logguer_erreur_si_le_logout_echoue', () => {
    // GIVEN
      const error = { message: 'Erreur' };
      authService.logout.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

    // WHEN
      component.confirmerLogout();

    // THEN
      expect(console.error).toHaveBeenCalled();
      expect(component.showLogoutModal).toBeFalse();
    });
  });

  describe('toggleMenu', () => {
    it('should_toggle_menuopen_false_true', () => {
    // GIVEN
      component.menuOpen = false;

    // WHEN
      component.toggleMenu();

    // THEN
      expect(component.menuOpen).toBeTrue();
    });

    it('should_toggle_menuopen_true_false', () => {
    // GIVEN
      component.menuOpen = true;

    // WHEN
      component.toggleMenu();

    // THEN
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('closeMenu', () => {
    it('should_definir_menuopen_false', () => {
    // GIVEN
      component.menuOpen = true;

    // WHEN
      component.closeMenu();

    // THEN
      expect(component.menuOpen).toBeFalse();
    });

    it('should_garder_menuopen_false_s_il_est_deja_faux', () => {
    // GIVEN
      component.menuOpen = false;

    // WHEN
      component.closeMenu();

    // THEN
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('onEsc', () => {
    it('should_close_menu_when_key_echap_pressee', () => {
    // GIVEN
      component.menuOpen = true;

    // WHEN
      component.onEsc();

    // THEN
      expect(component.menuOpen).toBeFalse();
    });

    it('should_be_declenche_par_appui_sur_la_touche_echap', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();
      component.menuOpen = true;
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      document.dispatchEvent(event);

    // THEN
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('roleUtilisateur', () => {
    it('should_avoir_property_roleutilisateur_definie_enum_roleutilisateur', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });
});

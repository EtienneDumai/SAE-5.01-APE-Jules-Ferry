/**
 * Fichier : frontend/src/app/app.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier participe au fonctionnement du frontend.
 * Il contient une partie de la logique, des donnees ou de l'affichage de l'application.
 */

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './services/Auth/auth.service';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let routerEvents: Subject<NavigationEnd>;
  let router: Pick<Router, 'events'>;

  const instantiate = () => TestBed.runInInjectionContext(() => new AppComponent());

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['init']);
    routerEvents = new Subject<NavigationEnd>();
    router = { events: routerEvents.asObservable() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should_create_application', () => {
  // GIVEN
    const app = instantiate();

  // WHEN

  // THEN
    expect(app).toBeTruthy();
  });

  it('should_avoir_title_frontend', () => {
  // GIVEN
    const app = instantiate();

  // WHEN

  // THEN
    expect(app.title).toEqual('frontend');
  });

  it('should_initialize_auth_detecte_screen_mobile', () => {
  // GIVEN
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    const app = instantiate();

    app.ngOnInit();

  // WHEN

  // THEN
    expect(authService.init).toHaveBeenCalled();
    expect(app.isMobile).toBeTrue();
  });

  it('should_cache_widgets_routes_masquees', () => {
  // GIVEN
    const app = instantiate();

    app.ngOnInit();

  // WHEN
    routerEvents.next(new NavigationEnd(1, '/login', '/login'));

  // THEN
    expect(app.showWidgets).toBeFalse();
  });

  it('should_display_widgets_routes_publiques', () => {
  // GIVEN
    const app = instantiate();
    app.showWidgets = false;

    app.ngOnInit();

  // WHEN
    routerEvents.next(new NavigationEnd(1, '/actualites', '/actualites'));

  // THEN
    expect(app.showWidgets).toBeTrue();
  });

  it('should_met_jour_size_screen_lors_resize', () => {
  // GIVEN
    const app = instantiate();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    app.ngOnInit();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 600 });

    app.onResize();

  // WHEN

  // THEN
    expect(app.isMobile).toBeTrue();
  });
});

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

  it('devrait créer l\'application', () => {
    const app = instantiate();
    expect(app).toBeTruthy();
  });

  it('devrait avoir le titre \'frontend\'', () => {
    const app = instantiate();
    expect(app.title).toEqual('frontend');
  });

  it('initialise l auth et détecte un écran mobile', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    const app = instantiate();

    app.ngOnInit();

    expect(authService.init).toHaveBeenCalled();
    expect(app.isMobile).toBeTrue();
  });

  it('cache les widgets sur les routes masquées', () => {
    const app = instantiate();

    app.ngOnInit();
    routerEvents.next(new NavigationEnd(1, '/login', '/login'));

    expect(app.showWidgets).toBeFalse();
  });

  it('affiche les widgets sur les routes publiques', () => {
    const app = instantiate();
    app.showWidgets = false;

    app.ngOnInit();
    routerEvents.next(new NavigationEnd(1, '/actualites', '/actualites'));

    expect(app.showWidgets).toBeTrue();
  });

  it('met à jour la taille d écran lors du resize', () => {
    const app = instantiate();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    app.ngOnInit();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 600 });
    app.onResize();

    expect(app.isMobile).toBeTrue();
  });
});

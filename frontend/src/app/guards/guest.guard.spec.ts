/**
 * Fichier : frontend/src/app/guards/guest.guard.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le guard guest.guard.
 * Il verifie que les regles d'acces sont bien appliquees.
 */

import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticatedStatus']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ]
    });
  });

  it('devrait être créé', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('autorise l accès quand l utilisateur n est pas connecté', () => {
    authService.isAuthenticatedStatus.and.returnValue(false);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige vers l accueil quand l utilisateur est connecté', () => {
    authService.isAuthenticatedStatus.and.returnValue(true);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});

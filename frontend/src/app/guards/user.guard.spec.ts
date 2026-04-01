/**
 * Fichier : frontend/src/app/guards/user.guard.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le guard user.guard.
 * Il verifie que les regles d'acces sont bien appliquées.
 */

import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

import { userGuard } from './user.guard';

describe('userGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userGuard(...guardParameters));

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

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('autorise l accès quand l utilisateur est connecté', () => {
    authService.isAuthenticatedStatus.and.returnValue(true);

    const result = executeGuard({} as never, [] as never);

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige vers login quand l utilisateur n est pas connecté', () => {
    authService.isAuthenticatedStatus.and.returnValue(false);

    const result = executeGuard({} as never, [] as never);

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

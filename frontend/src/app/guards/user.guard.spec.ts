/**
 * Fichier : frontend/src/app/guards/user.guard.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le guard user.guard.
 * Il verifie que les regles d'acces sont bien appliquées.
 */

import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { userGuard } from './user.guard';

describe('userGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

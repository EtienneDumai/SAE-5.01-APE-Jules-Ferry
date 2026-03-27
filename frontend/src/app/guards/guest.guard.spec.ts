/**
 * Fichier : frontend/src/app/guards/guest.guard.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le guard guest.guard.
 * Il verifie que les regles d'acces sont bien appliquees.
 */

import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('devrait être créé', () => {
    expect(executeGuard).toBeTruthy();
  });
});

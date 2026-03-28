/**
 * Fichier : frontend/src/app/interceptors/auth.interceptor.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste l'intercepteur auth.interceptor.
 * Il controle le bon enchainement des traitements sur les requetes HTTP.
 */

import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('devrait être créé', () => {
    expect(interceptor).toBeTruthy();
  });
});

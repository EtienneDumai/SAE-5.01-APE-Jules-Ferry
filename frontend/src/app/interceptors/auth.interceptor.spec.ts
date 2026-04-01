/**
 * Fichier : frontend/src/app/interceptors/auth.interceptor.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste l'intercepteur auth.interceptor.
 * Il controle le bon enchainement des traitements sur les requetes HTTP.
 */

import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { TokenService } from '../services/Token/token.service';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let tokenService: jasmine.SpyObj<TokenService>;

  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    tokenService = jasmine.createSpyObj<TokenService>('TokenService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService }
      ]
    });
  });

  it('should_be_create', () => {
    // GIVEN

    // WHEN

    // THEN
    expect(interceptor).toBeTruthy();
  });

  it('should_add_header_authorization_when_token_existe_api', () => {
    // GIVEN
    tokenService.getToken.and.returnValue('abc123');
    const request = new HttpRequest('GET', 'http://localhost:8000/api/user');
    const next: HttpHandlerFn = (req) => {
      expect(req.headers.get('Authorization')).toBe('Bearer abc123');
      return of(new HttpResponse({ status: 200 }));
    };

    // WHEN
    interceptor(request, next).subscribe();
  });

  it('should_laisse_requete_intacte_when_no_token_n_existe', () => {
    // GIVEN
    tokenService.getToken.and.returnValue(null);
    const request = new HttpRequest('GET', 'http://localhost:8000/api/user');
    const next: HttpHandlerFn = (req) => {
      expect(req.headers.has('Authorization')).toBeFalse();
      return of(new HttpResponse({ status: 200 }));
    };

    // WHEN
    interceptor(request, next).subscribe();
  });

  it('should_laisse_requete_intacte_when_url_ne_vise_pas_api', () => {
    // GIVEN
    tokenService.getToken.and.returnValue('abc123');
    const request = new HttpRequest('GET', 'http://example.com/assets/file.json');
    const next: HttpHandlerFn = (req) => {
      expect(req.headers.has('Authorization')).toBeFalse();
      return of(new HttpResponse({ status: 200 }));
    };

    // WHEN
    interceptor(request, next).subscribe();
  });
});

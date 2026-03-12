import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  const TOKEN_KEY = 'auth_token';
  const TEST_TOKEN = 'test-jwt-token-123456';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => {
    // Nettoyage après chaque test
    localStorage.clear();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('saveToken', () => {
    it('devrait sauvegarder le token dans localStorage', () => {
      service.saveToken(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it('devrait écraser le token existant', () => {
      service.saveToken('old-token');
      service.saveToken(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it('ne devrait PAS sauvegarder un token chaîne vide', () => {
      service.saveToken('');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('devrait retourner le token depuis localStorage', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN);
    });

    it('devrait retourner null si aucun token n\'existe', () => {
      expect(service.getToken()).toBeNull();
    });

    it('devrait retourner une chaîne vide si un token vide a été sauvegardé', () => {
      localStorage.setItem(TOKEN_KEY, '');
      expect(service.getToken()).toBe('');
    });
  });

  describe('removeToken', () => {
    it('devrait supprimer le token de localStorage', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      service.removeToken();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('ne devrait pas lever d\'erreur si le token n\'existe pas', () => {
      expect(() => service.removeToken()).not.toThrow();
    });

    it('devrait supprimer le token et getToken devrait retourner null ensuite', () => {
      service.saveToken(TEST_TOKEN);
      service.removeToken();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('devrait retourner vrai quand un token existe', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(service.hasToken()).toBe(true);
    });

    it('devrait retourner faux quand le token n\'existe pas', () => {
      expect(service.hasToken()).toBe(false);
    });

    it('devrait retourner vrai même avec un token chaîne vide', () => {
      localStorage.setItem(TOKEN_KEY, '');
      expect(service.hasToken()).toBe(true);
    });

    it('devrait retourner faux après la suppression du token', () => {
      service.saveToken(TEST_TOKEN);
      service.removeToken();
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('devrait gérer le cycle de vie complet du token', () => {
      // Vérifier qu'il n'y a pas de token au départ
      expect(service.hasToken()).toBe(false);

      // Sauvegarder un token
      service.saveToken(TEST_TOKEN);
      expect(service.hasToken()).toBe(true);
      expect(service.getToken()).toBe(TEST_TOKEN);

      // Supprimer le token
      service.removeToken();
      expect(service.hasToken()).toBe(false);
      expect(service.getToken()).toBeNull();
    });

    it('devrait maintenir le token à travers plusieurs opérations', () => {
      service.saveToken(TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN); // Multiple calls
      expect(service.hasToken()).toBe(true);
      expect(service.hasToken()).toBe(true); // Multiple calls
    });
  });
});

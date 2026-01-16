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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      service.saveToken(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it('should overwrite existing token', () => {
      service.saveToken('old-token');
      service.saveToken(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it('should save empty string token', () => {
      service.saveToken('');
      expect(localStorage.getItem(TOKEN_KEY)).toBe('');
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN);
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return empty string if empty token was saved', () => {
      localStorage.setItem(TOKEN_KEY, '');
      expect(service.getToken()).toBe('');
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      service.removeToken();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('should not throw error if token does not exist', () => {
      expect(() => service.removeToken()).not.toThrow();
    });

    it('should remove token and subsequent getToken should return null', () => {
      service.saveToken(TEST_TOKEN);
      service.removeToken();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('should return true when token exists', () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(service.hasToken()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.hasToken()).toBe(false);
    });

    it('should return true even with empty string token', () => {
      localStorage.setItem(TOKEN_KEY, '');
      expect(service.hasToken()).toBe(true);
    });

    it('should return false after token removal', () => {
      service.saveToken(TEST_TOKEN);
      service.removeToken();
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete token lifecycle', () => {
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

    it('should maintain token across multiple operations', () => {
      service.saveToken(TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN); // Multiple calls
      expect(service.hasToken()).toBe(true);
      expect(service.hasToken()).toBe(true); // Multiple calls
    });
  });
});

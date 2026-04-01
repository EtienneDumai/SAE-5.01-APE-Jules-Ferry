/**
 * Fichier : frontend/src/app/services/Token/token.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Token.
 */

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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('saveToken', () => {
    it('should_save_token_localstorage', () => {
    // GIVEN

    // WHEN
      service.saveToken(TEST_TOKEN);

    // THEN
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it('should_ecraser_token_existant', () => {
    // GIVEN

    // WHEN
      service.saveToken('old-token');

      service.saveToken(TEST_TOKEN);

    // THEN
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    // MODIFICATION ICI : On utilise bien TOKEN_KEY
    it('should_not_save_token_chaine_empty', () => {
    // GIVEN

    // WHEN
      service.saveToken('');

    // THEN
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull(); 
    });
  });

  describe('getToken', () => {
    it('should_return_token_localstorage', () => {
    // GIVEN
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);

    // WHEN

    // THEN
      expect(service.getToken()).toBe(TEST_TOKEN);
    });

    it('should_return_null_no_token_n_existe', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(service.getToken()).toBeNull();
    });
    // On a supprimé le test qui s'attendait à recevoir une chaîne vide ici
  });

  describe('removeToken', () => {
    it('should_delete_token_localstorage', () => {
    // GIVEN
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);

    // WHEN
      service.removeToken();

    // THEN
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('should_not_lever_erreur_si_le_token_n_existe_pas', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(() => service.removeToken()).not.toThrow();
    });

    it('should_delete_token_gettoken_devrait_return_null_ensuite', () => {
    // GIVEN

    // WHEN
      service.saveToken(TEST_TOKEN);

      service.removeToken();

    // THEN
      expect(service.getToken()).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('should_return_true_when_token_existe', () => {
    // GIVEN
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);

    // WHEN

    // THEN
      expect(service.hasToken()).toBe(true);
    });

    it('should_return_false_when_token_n_existe_pas', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(service.hasToken()).toBe(false);
    });
    // On a supprimé le test qui disait qu'une chaîne vide était valide ici

    it('should_return_false_suppression_token', () => {
    // GIVEN

    // WHEN
      service.saveToken(TEST_TOKEN);

      service.removeToken();

    // THEN
      expect(service.hasToken()).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should_handle_cycle_vie_complet_token', () => {
    // GIVEN
      // Vérifier qu'il n'y a pas de token au départ

    // WHEN

    // THEN
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

    it('should_maintenir_token_travers_plusieurs_operations', () => {
    // GIVEN

    // WHEN
      service.saveToken(TEST_TOKEN);

    // THEN
      expect(service.getToken()).toBe(TEST_TOKEN);
      expect(service.getToken()).toBe(TEST_TOKEN);
      expect(service.hasToken()).toBe(true);
      expect(service.hasToken()).toBe(true);
    });
  });
});
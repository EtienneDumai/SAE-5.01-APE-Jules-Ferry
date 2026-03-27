/**
 * Fichier : frontend/src/app/services/Token/token.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Token.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * save token dans localStorage
   */
  saveToken(token: string): void {
    // On ne sauvegarde que si c'est un vrai token
    if (token && token !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * recup du token depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * suppr du token du localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * check si token present
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }
}
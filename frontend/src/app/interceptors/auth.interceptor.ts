/**
 * Fichier : frontend/src/app/interceptors/auth.interceptor.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier definit l'intercepteur auth pour les requetes HTTP.
 * Il ajoute ou adapte des traitements communs avant ou apres les appels API.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/Token/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  // Si un token existe et que la requête va vers l'API
  if (token && req.url.includes('/api/')) {
    // Cloner la requête et ajouter le header Authorization
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // Sinon, passer la requête sans modification
  return next(req);
};
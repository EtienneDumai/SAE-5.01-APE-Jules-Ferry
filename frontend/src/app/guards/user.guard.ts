/**
 * Fichier : frontend/src/app/guards/user.guard.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere le guard user.
 */

import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { inject } from '@angular/core';

export const userGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //si utilisateur connecté, redirect vers accueil
  if (authService.isAuthenticatedStatus()) {
    return true;
  }
  else{
    router.navigate(['/login']);
    return false;
  }
};
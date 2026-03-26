import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //si utilisateur connecté, redirect vers accueil
  if (authService.isAuthenticatedStatus()) {
    router.navigate(['/']);
    return false;
  }

  // sinon on authorise l'accès
  return true;
};
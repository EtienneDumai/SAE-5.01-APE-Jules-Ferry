import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { inject } from '@angular/core';

export const userGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //si utilisateur connecté, redirect vers accueil
  if (authService.isAuthenticated()) {
    return true;
  }
  else{
    router.navigate(['/login']);
    return false;
  }
};

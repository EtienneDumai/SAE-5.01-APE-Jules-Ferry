import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('administrateur')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

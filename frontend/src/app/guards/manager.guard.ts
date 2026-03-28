/**
 * Fichier : frontend/src/app/guards/manager.guard.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere le guard manager.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { RoleUtilisateur } from '../enums/RoleUtilisateur/role-utilisateur';
import { map, take } from 'rxjs/operators';
import { ToastService } from '../services/Toast/toast.service';
import { TypeErreurToast } from '../enums/TypeErreurToast/type-erreur-toast';

export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      //accepte admin ou membre du bureau pour gestion evenement
      if (user && (user.role === RoleUtilisateur.administrateur || user.role === RoleUtilisateur.membre_bureau)) {
        return true;
      }

      toastService.show("Accès réservé aux gestionnaires (Admin ou Bureau).", TypeErreurToast.ERROR);
      router.navigate(['/']);
      return false;
    })
  );
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { RoleUtilisateur } from '../enums/RoleUtilisateur/role-utilisateur';
import { map, take } from 'rxjs/operators';
import { ToastService } from '../services/Toast/toast.service';
import { TypeErreurToast } from '../enums/TypeErreurToast/type-erreur-toast';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return authService.currentUser$.pipe(
    take(1), // On prend juste la valeur actuelle
    map(user => {
      // Vérifie si user existe ET si son rôle est Administrateur
      if (user && user.role === RoleUtilisateur.administrateur) {
        return true;
      }

      // Sinon, on redirige
      toastService.show("Accès réservé aux administrateurs.", TypeErreurToast.ERROR);
      router.navigate(['/']); // Retour accueil
      return false;
    })
  );
};

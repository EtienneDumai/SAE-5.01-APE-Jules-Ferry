import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { managerGuard } from './manager.guard';
import { AuthService } from '../services/Auth/auth.service';
import { ToastService } from '../services/Toast/toast.service';
import { RoleUtilisateur } from '../enums/RoleUtilisateur/role-utilisateur';
import { TypeErreurToast } from '../enums/TypeErreurToast/type-erreur-toast';
import { Utilisateur } from '../models/Utilisateur/utilisateur';

describe('managerGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let toastService: jasmine.SpyObj<ToastService>;

  const createAuthService = (role: RoleUtilisateur | null) => ({
    currentUser$: of(role ? ({ role } as Utilisateur) : null),
  });

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toastService = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
  });

  async function executeGuard(role: RoleUtilisateur | null) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: createAuthService(role) },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService },
      ],
    });

    return firstValueFrom(
      TestBed.runInInjectionContext(
        () => managerGuard({} as never, {} as never) as Observable<boolean>,
      ),
    );
  }

  it('should_allow_access_when_user_is_administrator', async () => {
  // GIVEN
    await expectAsync(executeGuard(RoleUtilisateur.administrateur)).toBeResolvedTo(true);

  // WHEN

  // THEN
    expect(toastService.show).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should_allow_access_when_user_is_member_bureau', async () => {
  // GIVEN
    await expectAsync(executeGuard(RoleUtilisateur.membre_bureau)).toBeResolvedTo(true);

  // WHEN

  // THEN
    expect(toastService.show).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should_deny_access_when_user_is_not_manager', async () => {
  // GIVEN
    await expectAsync(executeGuard(RoleUtilisateur.parent)).toBeResolvedTo(false);

  // WHEN

  // THEN
    expect(toastService.show).toHaveBeenCalledWith(
      'Accès réservé aux gestionnaires (Admin ou Bureau).',
      TypeErreurToast.ERROR,
    );
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});

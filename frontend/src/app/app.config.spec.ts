import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { appConfig } from './app.config';
import { AuthService } from './services/Auth/auth.service';

describe('appConfig', () => {
  it('Devrait configurer les providers globaux attendus', () => {
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers?.length).toBe(4);
  });

  it('Devrait enregistrer le locale français', () => {
    const localeProvider = appConfig.providers?.find(
      (provider): provider is { provide: typeof LOCALE_ID; useValue: string } =>
        !!provider && typeof provider === 'object' && 'provide' in provider && provider.provide === LOCALE_ID,
    );

    expect(localeProvider?.useValue).toBe('fr-FR');
  });

  it('Devrait initialiser l authentification au démarrage', async () => {
    const initializerProvider = appConfig.providers?.find(
      (provider): provider is {
        provide: typeof APP_INITIALIZER;
        multi?: boolean;
        deps: [typeof AuthService];
        useFactory: (auth: Pick<AuthService, 'init'>) => () => unknown;
      } =>
        !!provider && typeof provider === 'object' && 'provide' in provider && provider.provide === APP_INITIALIZER,
    );

    expect(initializerProvider).toBeDefined();
    expect(initializerProvider?.multi).toBeTrue();
    expect(initializerProvider?.deps).toEqual([AuthService]);

    const authService = jasmine.createSpyObj<Pick<AuthService, 'init'>>('AuthService', ['init']);
    authService.init.and.stub();

    const initializer = initializerProvider!.useFactory(authService);
    initializer();

    expect(authService.init).toHaveBeenCalled();
  });
});

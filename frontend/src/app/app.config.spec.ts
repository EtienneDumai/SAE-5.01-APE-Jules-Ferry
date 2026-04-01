import { APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { appConfig } from './app.config';
import { AuthService } from './services/Auth/auth.service';

describe('appConfig', () => {
  it('should_configure_expected_global_providers', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers?.length).toBe(4);
  });

  it('should_register_french_locale', () => {
    // GIVEN
    const localeProvider = appConfig.providers?.find(
      (provider): provider is { provide: typeof LOCALE_ID; useValue: string } =>
        !!provider && typeof provider === 'object' && 'provide' in provider && provider.provide === LOCALE_ID,
    );

    // WHEN

    // THEN
    expect(localeProvider?.useValue).toBe('fr-FR');
  });

  it('should_initialize_authentication_app_startup', async () => {
    // GIVEN
    const initializerProvider = appConfig.providers?.find(
      (provider): provider is {
        provide: typeof APP_INITIALIZER;
        multi?: boolean;
        deps: [typeof AuthService];

        useFactory: (auth: Pick<AuthService, 'init'>) => () => unknown;
      } =>
        !!provider && typeof provider === 'object' && 'provide' in provider && provider.provide === APP_INITIALIZER,
    );

    // WHEN

    // THEN
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

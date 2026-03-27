/**
 * Fichier : frontend/src/app/app.config.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier configure le demarrage de l'application Angular.
 * Il enregistre les providers et les services globaux utilises par le frontend.
 */

import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { AuthService } from './services/Auth/auth.service';

registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthService],
      useFactory: (auth: AuthService) => () => auth.init()
    },
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
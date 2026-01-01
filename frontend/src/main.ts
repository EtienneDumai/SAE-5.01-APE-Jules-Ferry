import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { ToastService } from './app/services/Toast/toast.service';

bootstrapApplication(AppComponent, appConfig).then(appRef => {
  const injector = appRef.injector;
  (window as any).toast = injector.get(ToastService);
});

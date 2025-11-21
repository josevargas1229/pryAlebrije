import { ApplicationConfig, provideZoneChangeDetection, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { csrfInterceptor } from './interceptors/csrf.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { SwUpdatesService } from './sw-updates.service';

export function appInitFactory() {
  const swUpdates = inject(SwUpdatesService);

  return () => {
    // Solo inicializa actualizaciones de versión del SW
    swUpdates.init();
    // No retornas ninguna Promise/Observable aquí
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'x-csrf-token',
        headerName: 'x-csrf-token',
      }),
      withInterceptors([csrfInterceptor, errorInterceptor]),
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideAnimations(),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),

    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      multi: true
    }
  ]
};

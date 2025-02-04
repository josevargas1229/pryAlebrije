import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  ...appConfig,
  providers: [
    provideServerRendering(), // Necesario para SSR
    ...appConfig.providers,
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

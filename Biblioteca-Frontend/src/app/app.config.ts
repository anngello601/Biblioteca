import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // 👈 Importa esto
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // 👈 AÑADE ESTA LÍNEA (Reemplaza a Zone.js)
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialsInterceptor])
    )
  ]
};
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app.routes';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { authInterceptor, errorInterceptor } from './core/interceptors/index';

/**
 * Custom Translation Loader
 * Loads translation files from assets/i18n directory
 */
export class JsonTranslationLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`).pipe(
      catchError(error => {
        console.error(`Failed to load translations for ${lang}:`, error);
        // Return empty object to prevent app crash
        return of({});
      })
    );
  }
}

/**
 * Factory function to create translation loader
 */
export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new JsonTranslationLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    )
  ]
};


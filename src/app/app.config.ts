import { HttpClient, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

// Importaciones para localización
import { registerLocaleData } from '@angular/common';
import localeEnUS from '@angular/common/locales/en';
import localeEsES from '@angular/common/locales/es';
import localeEsCO from '@angular/common/locales/es-CO';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';
import { httpHeadersInterceptor } from './shared/interceptores/http-headers.interceptor';
import { httpSpinnerInterceptor } from './shared/interceptores/http-spinner.interceptor';

// Registrar los locales
registerLocaleData(localeEsCO);
registerLocaleData(localeEsES);
registerLocaleData(localeEnUS);

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' }, // Locale por defecto
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([httpHeadersInterceptor, httpSpinnerInterceptor])
    ),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        },
        defaultLanguage: 'en'
      }),
    ),
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined'
      }
    },
    {
      provide: MAT_CARD_CONFIG,
      useValue: { appearance: 'outlined' }
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'white-dialog-container'
      }
    },
    {
      provide: MAT_MENU_DEFAULT_OPTIONS,
      useValue: {
        overlayPanelClass: 'white-menu-panel',
      }
    }
  ]
};

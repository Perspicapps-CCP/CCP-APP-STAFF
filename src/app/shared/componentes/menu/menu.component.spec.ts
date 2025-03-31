import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Directive, Input, Pipe, PipeTransform } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../../modules/auth/servicios/login.service';
import { LanguageConfig } from '../../modelos/LanguajeConfig.interface';
import { sharedImports } from '../../otros/shared-imports';
import { LocalizationService } from '../../servicios/localization.service';
import { MenuComponent } from './menu.component';

// Mock para LocalizationService
class MockLocalizationService {
  availableLanguages: LanguageConfig[] = [
    {
      langCode: 'es',
      localeCode: 'es-CO',
      name: 'Español (CO)',
      currencyCode: 'COP',
      region: 'Colombia',
    },
    {
      langCode: 'es',
      localeCode: 'es-ES',
      name: 'Español (ES)',
      currencyCode: 'EUR',
      region: 'España',
    },
    {
      langCode: 'en',
      localeCode: 'en-US',
      name: 'English (US)',
      currencyCode: 'USD',
      region: 'United States',
    },
  ];

  setLocale(): void {
    // Mock implementation that doesn't rely on 'this' context
  }
}

class MockLoginService {
  cerrarSesion() {
    // Mock implementation that doesn't rely on 'this' context
    return;
  }
}

// Mock para TranslateService
class MockTranslateService {
  get(key: string | string[]): any {
    // Devuelve un observable
    return {
      subscribe: (callback: any) => {
        if (typeof key === 'string') {
          callback(key);
        } else {
          const result: Record<string, string> = {};
          key.forEach(k => (result[k] = k));
          callback(result);
        }
        return {
          unsubscribe: () => {
            // Mock implementation that doesn't rely on 'this
          },
        };
      },
    };
  }

  instant(key: string | string[], interpolateParams?: object): string | any {
    if (typeof key === 'string') {
      return key;
    }
    const result: Record<string, string> = {};
    key.forEach(k => (result[k] = k));
    return result;
  }

  // Añadimos otros métodos que podrían ser necesarios
  onLangChange = {
    subscribe: () => ({
      unsubscribe: () => {
        // Mock implementation that doesn't rely on 'this' context
      },
    }),
  };

  onTranslationChange = {
    subscribe: () => ({
      unsubscribe: () => {
        // Mock implementation that doesn't rely on 'this' context
      },
    }),
  };

  onDefaultLangChange = {
    subscribe: () => ({
      unsubscribe: () => {
        // Mock implementation that doesn't rely on 'this' context
      },
    }),
  };

  // Idioma actual
  currentLang = 'es';

  // Cambiar idioma
  use(lang: string) {
    this.currentLang = lang;
    return {
      subscribe: (callback: any) => {
        callback(lang);
        return {
          unsubscribe: () => {
            // Mock implementation that doesn't rely on 'this' context
          },
        };
      },
    };
  }
}

// Pipe Mock para translate (ahora como standalone)
@Pipe({
  name: 'translate',
  standalone: true,
})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

// Directiva Mock para ngbTooltip (ahora como standalone)
@Directive({
  selector: '[appNgbTooltip]',
  standalone: true,
})
class MockTooltipDirective {
  @Input() ngbTooltip?: string;
  @Input() placement?: string;
}

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let localizationService: LocalizationService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let service: LoginService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterLink,
        RouterLinkActive,
        sharedImports,
        MatMenuModule,
        MenuComponent,
        // Importar los mocks en lugar de declararlos
        MockTranslatePipe,
        MockTooltipDirective,
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        { provide: LoginService, useClass: MockLoginService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    localizationService = TestBed.inject(LocalizationService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    service = TestBed.inject(LoginService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items', () => {
    expect(component.menuItems.length).toBeGreaterThan(0);
  });

  it('should change language', () => {
    const spy = spyOn(localizationService, 'setLocale');

    component.cambiarIdioma({
      langCode: 'es',
      localeCode: 'es-CO',
      name: 'Español (CO)',
      currencyCode: 'COP',
      region: 'Colombia',
    });
    expect(spy).toHaveBeenCalledWith('es-CO');
  });

  it('should call cerrarSesion', () => {
    const spy = spyOn(service, 'cerrarSesion').and.callThrough();
    component.cerrarSesion();
    expect(spy).toHaveBeenCalled();
  });
});

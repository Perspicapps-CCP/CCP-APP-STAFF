import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasComponent } from './ventas.component';
import { VentasService } from '../../servicios/ventas.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { VentaTabla, VentaQuery } from '../../interfaces/ventas.interface';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { LocalizationService } from '../../../../shared/servicios/localization.service';

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

// Mock del servicio de traducción
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {
    //funcion mock
  }
  use() {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock del servicio de localización
class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() {
    return 'es-ES';
  }
  getLang() {
    return 'es';
  }
  getCurrencyCode() {
    return 'EUR';
  }
}

// Mock del servicio de ventas
class MockVentasService {
  obtenerVentas() {
    return of<VentaTabla[]>([]);
  }

  getTotalVentas() {
    return 0;
  }

  obtenerUrlDescarga() {
    return 'http://example.com/download';
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: VentaTabla[], searchTerm: string) {
    return items;
  }
}

// Mock para MatDialog
class MockMatDialog {
  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
    } as MatDialogRef<any>;
  }
}

describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;
  let ventasService: VentasService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VentasComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: VentasService, useClass: MockVentasService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignorar errores de componentes secundarios
    }).compileComponents();

    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    ventasService = TestBed.inject(VentasService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(ventasService, 'obtenerVentas').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

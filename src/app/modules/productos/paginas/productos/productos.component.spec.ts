import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ProductosComponent } from './productos.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductosService } from '../../servicios/productos.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { Producto } from '../../interfaces/productos.interface';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() {
    return 'es-ES';
  }
  getCurrentLanguage() {
    return 'es';
  }
  getCurrentLocale() {
    return 'es-ES';
  }
  getCurrencyCode() {
    return 'EUR';
  }
}

class MockProductosService {
  obtenerProductos() {
    return of<Producto[]>([
      {
        product_id: '1',
        product_name: 'Producto1',
        product_code: 'p001',
        manufacturer_name: 'Fabricante1',
        price: 1000,
        images: ['https://dummyimage.com/600x400/000/fff.jpg'],
        quantity: '10',
        warehouse_name: 'Bodega1',
      },
      {
        product_id: '2',
        product_name: 'Producto2',
        product_code: 'p002',
        manufacturer_name: 'Fabricante2',
        price: 1000,
        images: ['https://dummyimage.com/600x400/000/fff.jpg'],
        quantity: '10',
        warehouse_name: 'Bodega2',
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: Producto[], searchTerm: string) {
    return items.filter(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}

// Mock para MatDialog
class MockMatDialog {
  // Añadir afterAllClosed como un Observable
  afterAllClosed = of({});

  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: any) => {
        console.log('Dialog closed with result:', result);
      },
    } as MatDialogRef<any>;
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
    console.log(`Default language set to: ${lang}`);
  }
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}
describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let productosService: ProductosService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: ProductosService, useClass: MockProductosService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
    productosService = TestBed.inject(ProductosService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(productosService, 'obtenerProductos').and.callThrough();
    spyOn(component, 'filterProductos').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

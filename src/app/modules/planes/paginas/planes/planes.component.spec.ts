import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { PlanesComponent } from './planes.component';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { PlanesService } from '../../servicios/planes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrearPlanVentaComponent } from '../../componentes/crear-plan-venta/crear-plan-venta.component';
import { PlanVenta } from '../../interfaces/planes.interface';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';

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

// Mock del servicio de planes
class MockPlanesService {
  obtenerPlanes() {
    return of<PlanVenta[]>([
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: 'prod-001',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        goal: '10000',
        sellers: [
          {
            id: 'seller-001',
            full_name: 'Juan Pérez',
            email: 'juan@example.com',
            id_type: 'CC',
            identification: '123456789',
            phone: '3001234567',
            username: 'jperez',
          },
        ],
        product: {
          id: 'prod-001',
          name: 'Producto 1',
          product_code: 'P001',
          price: 1000,
          images: [],
        },
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        product_id: 'prod-002',
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-06-30'),
        goal: '5000',
        sellers: [
          {
            id: 'seller-002',
            full_name: 'Ana Gómez',
            email: 'ana@example.com',
            id_type: 'CC',
            identification: '987654321',
            phone: '3007654321',
            username: 'agomez',
          },
        ],
        product: {
          id: 'prod-001',
          name: 'Producto 1',
          product_code: 'P001',
          price: 1000,
          images: [],
        },
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: PlanVenta[], searchTerm: string) {
    return items.filter(item => item.product_id.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}

// Mock para el LocalDatePipe
class MockLocalDatePipe {
  transform(date: string | Date) {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return date;
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
  use() {
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

// Mock para MatDialog
class MockMatDialog {
  dialogRef = of({}); // Add this property
  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: unknown) => {
        console.log('Dialog closed with result:', result);
      },
    } as MatDialogRef<any>;
  }
}

describe('PlanesComponent', () => {
  let component: PlanesComponent;
  let fixture: ComponentFixture<PlanesComponent>;
  let planesService: PlanesService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlanesComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: PlanesService, useClass: MockPlanesService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: LocalDatePipe, useClass: MockLocalDatePipe },
        {
          provide: HighlightTextPipe,
          useClass: class {
            transform(text: string, search: string) {
              return text;
            }
          },
        },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanesComponent);
    component = fixture.componentInstance;
    planesService = TestBed.inject(PlanesService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(planesService, 'obtenerPlanes').and.callThrough();
    spyOn(component, 'filterPlanes').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los planes al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(planesService.obtenerPlanes).toHaveBeenCalled();

    // Verificar que se establecieron los planes
    expect(component.planesVentas.length).toBe(2);
    expect(component.planesVentas[0].product_id).toBe('prod-001');
  });

  it('debería inicializar filterPlanes$ correctamente', () => {
    // Verificar que se llamó al método filterPlanes
    expect(component.filterPlanes).toHaveBeenCalled();

    // Verificar que filterPlanes$ está definido
    expect(component.filterPlanes$).toBeDefined();
  });

  it('debería alternar la selección de plan al llamar toggleExpansion', () => {
    // Inicialmente ningún plan está seleccionado
    expect(component.planVentaSelected).toBeNull();

    // Seleccionar un plan
    const plan = component.planesVentas[0];
    component.toggleExpansion(plan);
    expect(component.planVentaSelected).toBe(plan);

    // Volver a llamar al mismo plan debería deseleccionarlo
    component.toggleExpansion(plan);
    expect(component.planVentaSelected).toBeNull();

    // Seleccionar otro plan después de tener uno seleccionado
    const otroPlan = component.planesVentas[1];
    component.toggleExpansion(plan);
    component.toggleExpansion(otroPlan);
    expect(component.planVentaSelected).toBe(otroPlan);
  });

  it('debería filtrar planes correctamente', () => {
    // Espiar métodos relevantes
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaPlanes.setValue('prod-001');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('prod-001');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('debería retornar todos los planes si el término de búsqueda está vacío', () => {
    const result = component.buscar('');
    expect(result.length).toBe(2);
    expect(result).toEqual(component.planesVentas);
  });

  it('debería abrir el modal de crear plan y obtener planes después de cerrar', () => {
    // Espiar el método obtenerPlanes
    spyOn(component, 'obtenerPlanes');

    // Llamar al método
    component.abrirModalCrearPlan();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(CrearPlanVentaComponent, {
      width: '37.0625rem',
    });

    // Verificar que se llamó a obtenerPlanes después de cerrar el diálogo
    expect(component.obtenerPlanes).toHaveBeenCalled();
  });
});

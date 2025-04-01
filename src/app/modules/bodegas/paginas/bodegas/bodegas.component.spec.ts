import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { AgregarBodegaComponent } from '../../componentes/agregar-bodega/agregar-bodega.component';
import { Bodega } from '../../interfaces/bodega.interface';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasComponent } from './bodegas.component';

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

// Mock del servicio de bodegas
class MockBodegasService {
  obtenerBodegas() {
    return of<Bodega[]>([
      {
        warehouse_id: '1',
        warehouse_name: 'Bodega Central',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123 #45-67',
        phone: '6011234567',
      },
      {
        warehouse_id: '2',
        warehouse_name: 'Almacén Norte',
        country: 'Colombia',
        city: 'Medellín',
        address: 'Carrera 45 #78-90',
        phone: '6049876543',
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: Bodega[], searchTerm: string) {
    return items.filter(item =>
      item.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
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
    this.onDefaultLangChange.next({ lang });
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
  getTranslation() {
    return of({});
  }
}

// Mock para MatDialog
class MockMatDialog {
  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of(true),
      close: (result?: any) => {
        console.log('Dialog closed with result:', result);
      },
    } as MatDialogRef<any>;
  }
}

describe('BodegasComponent', () => {
  let component: BodegasComponent;
  let fixture: ComponentFixture<BodegasComponent>;
  let bodegasService: BodegasService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BodegasComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: BodegasService, useClass: MockBodegasService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BodegasComponent);
    component = fixture.componentInstance;
    bodegasService = TestBed.inject(BodegasService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(bodegasService, 'obtenerBodegas').and.callThrough();
    spyOn(component, 'filterBodegas').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las bodegas al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(bodegasService.obtenerBodegas).toHaveBeenCalled();

    // Verificar que se establecieron las bodegas
    expect(component.bodegas.length).toBe(2);
    expect(component.bodegas[0].warehouse_name).toBe('Bodega Central');
  });

  it('debería inicializar filterBodegas$ correctamente', () => {
    // Verificar que se llamó al método filterBodegas
    expect(component.filterBodegas).toHaveBeenCalled();

    // Verificar que filterBodegas$ está definido
    expect(component.filterBodegas$).toBeDefined();
  });

  it('debería alternar la selección de bodega al llamar toggleExpansion', () => {
    // Inicialmente ninguna bodega está seleccionada
    expect(component.bodegaSelected).toBeNull();

    // Seleccionar una bodega
    const bodega: Bodega = {
      warehouse_id: '1',
      warehouse_name: 'Bodega Central',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123 #45-67',
      phone: '6011234567',
    };
    component.toggleExpansion(bodega);
    expect(component.bodegaSelected).toBe(bodega);

    // Volver a llamar a la misma bodega debería deseleccionarla
    component.toggleExpansion(bodega);
    expect(component.bodegaSelected).toBeNull();

    // Seleccionar otra bodega después de tener una seleccionada
    const otraBodega: Bodega = {
      warehouse_id: '2',
      warehouse_name: 'Almacén Norte',
      country: 'Colombia',
      city: 'Medellín',
      address: 'Carrera 45 #78-90',
      phone: '6049876543',
    };
    component.toggleExpansion(bodega);
    component.toggleExpansion(otraBodega);
    expect(component.bodegaSelected).toBe(otraBodega);
  });

  it('debería filtrar bodegas correctamente', () => {
    // Simular búsqueda
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaBodegas.setValue('Central');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('Central');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('debería retornar todas las bodegas cuando el término de búsqueda está vacío', () => {
    const result = component.buscar('');
    expect(result.length).toBe(2);
  });

  it('debería abrir el modal de crear bodega', () => {
    // Llamar al método
    component.abrirModalCrearBodega();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(AgregarBodegaComponent, {
      width: '600px',
    });
  });

  it('debería volver a cargar las bodegas después de cerrar el modal con resultado positivo', () => {
    // Resetear el contador de llamadas antes de la prueba
    (bodegasService.obtenerBodegas as jasmine.Spy).calls.reset();

    // Llamar al método
    component.abrirModalCrearBodega();

    // Verificar que se llamó a obtenerBodegas después de cerrar el modal
    expect(bodegasService.obtenerBodegas).toHaveBeenCalled();
  });
});

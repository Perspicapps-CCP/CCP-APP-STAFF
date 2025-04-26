import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RutasComponent } from './rutas.component';
import { RutasService } from '../../servicios/rutas.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RutaEntrega } from '../../interfaces/rutas-entrega';
import { GenerarRutaComponent } from '../../componentes/generar-ruta/generar-ruta.component';
import { VisorMapaComponent } from '../../../../shared/componentes/visor-mapa/visor-mapa.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { RutaEntregaMapa } from '../../interfaces/ruta-entrega-mapa';

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
    console.log(`Default language set to: ${lang}`);
  }
  use() {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock del servicio de rutas
class MockRutasService {
  obtenerRutasEntrega() {
    return of<RutaEntrega[]>([
      {
        shipping_number: '001',
        license_plate: 'ABC123',
        diver_name: 'Juan Pérez',
        warehouse: {
          warehouse_id: 'w001',
          warehouse_name: 'Bodega Central',
        },
        delivery_status: 'En ruta',
        orders: [],
      },
      {
        shipping_number: '002',
        license_plate: 'XYZ789',
        diver_name: 'María López',
        warehouse: {
          warehouse_id: 'w002',
          warehouse_name: 'Bodega Norte',
        },
        delivery_status: 'Pendiente',
        orders: [],
      },
    ]);
  }

  obtenerRutaMapa(shippingNumber: string) {
    return of<RutaEntregaMapa[]>([
      {
        shipping_number: shippingNumber,
        order_number: 'ORD001',
        order_address: 'Calle Principal 123',
        customer_phone_number: '1234567890',
        latitude: '4.6097',
        longitude: '-74.0817',
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: RutaEntrega[], searchTerm: string) {
    return items.filter(
      item =>
        item.shipping_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.diver_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
}

// Mock para MatDialog
class MockMatDialog {
  afterClosed = new BehaviorSubject<any>({});

  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: any) => {
        console.log('Dialog closed with result:', result);
      },
    } as MatDialogRef<any>;
  }
}

// Mock para MatSnackBar
class MockMatSnackBar {
  open(message: string, action = '', config?: any) {
    return {
      onAction: () => of({}),
      dismiss: () => {
        console.log('Snackbar dismissed');
      },
    };
  }
}

describe('RutasComponent', () => {
  let component: RutasComponent;
  let fixture: ComponentFixture<RutasComponent>;
  let rutasService: RutasService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RutasComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: RutasService, useClass: MockRutasService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RutasComponent);
    component = fixture.componentInstance;
    rutasService = TestBed.inject(RutasService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);
    translateService = TestBed.inject(TranslateService);

    // Espiar métodos para verificar llamadas
    spyOn(rutasService, 'obtenerRutasEntrega').and.callThrough();
    spyOn(component, 'filterRutas').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();
    spyOn(component, 'obtenerRutas').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las rutas al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(rutasService.obtenerRutasEntrega).toHaveBeenCalled();

    // Verificar que se establecieron las rutas
    expect(component.rutas.length).toBe(2);
    expect(component.rutas[0].shipping_number).toBe('001');
    expect(component.rutas[0].diver_name).toBe('Juan Pérez');
  });

  it('debería inicializar filterRutas$ correctamente', () => {
    // Verificar que se llamó al método filterRutas
    expect(component.filterRutas).toHaveBeenCalled();

    // Verificar que filterRutas$ está definido
    expect(component.filterRutas$).toBeDefined();
  });

  it('debería alternar la selección de ruta al llamar toggleExpansion', () => {
    // Inicialmente ninguna ruta está seleccionada
    expect(component.rutaSelected).toBeNull();

    // Seleccionar una ruta
    const ruta: RutaEntrega = {
      shipping_number: '001',
      license_plate: 'ABC123',
      diver_name: 'Juan Pérez',
      warehouse: {
        warehouse_id: 'w001',
        warehouse_name: 'Bodega Central',
      },
      delivery_status: 'En ruta',
      orders: [],
    };

    component.toggleExpansion(ruta);
    expect(component.rutaSelected).toBe(ruta);

    // Volver a llamar a la misma ruta debería deseleccionarla
    component.toggleExpansion(ruta);
    expect(component.rutaSelected).toBeNull();

    // Seleccionar otra ruta después de tener una seleccionada
    const otraRuta: RutaEntrega = {
      shipping_number: '002',
      license_plate: 'XYZ789',
      diver_name: 'María López',
      warehouse: {
        warehouse_id: 'w002',
        warehouse_name: 'Bodega Norte',
      },
      delivery_status: 'Pendiente',
      orders: [],
    };

    component.toggleExpansion(ruta);
    component.toggleExpansion(otraRuta);
    expect(component.rutaSelected).toBe(otraRuta);
  });

  it('debería filtrar rutas correctamente', () => {
    // Simular búsqueda
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaRutas.setValue('Juan');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('Juan');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('debería retornar todas las rutas cuando la búsqueda está vacía', () => {
    // Probar con cadena vacía
    const resultado = component.buscar('');
    expect(resultado.length).toBe(2);
  });

  it('debería abrir el modal de crear rutas y refrescar rutas al cerrar', () => {
    // Resetear el contador de llamadas a obtenerRutas para la prueba
    (component.obtenerRutas as jasmine.Spy).calls.reset();

    // Llamar al método
    component.abrirModalCrearRutas();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(GenerarRutaComponent, {
      width: '29.125rem',
    });

    // Simular que todos los diálogos se han cerrado
    (dialog as any).afterClosed.next({});

    // Verificar que se llamó a obtenerRutas después de cerrar el diálogo
    expect(component.obtenerRutas).toHaveBeenCalled();
  });

  it('debería abrir el visor de mapa para una ruta', fakeAsync(() => {
    // Espiar el método obtenerRutaMapa
    spyOn(rutasService, 'obtenerRutaMapa').and.callThrough();
    spyOn(console, 'log').and.callThrough();

    // Crear una ruta de prueba
    const ruta: RutaEntrega = {
      shipping_number: '001',
      license_plate: 'ABC123',
      diver_name: 'Juan Pérez',
      warehouse: {
        warehouse_id: 'w001',
        warehouse_name: 'Bodega Central',
      },
      delivery_status: 'En ruta',
      orders: [],
    };

    // Llamar al método
    component.abrirVisorRuta(ruta);
    tick(); // esperar a que se resuelvan las promesas

    // Verificar que se llamó al servicio con el parámetro correcto
    expect(rutasService.obtenerRutaMapa).toHaveBeenCalledWith('001');

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(VisorMapaComponent, {
      data: [
        {
          latitude: '4.6097',
          longitude: '-74.0817',
          title: 'Calle Principal 123',
          description: '1234567890',
        },
      ],
      width: '70vw',
      height: '70vh',
      maxWidth: '70vw',
    });
  }));
});

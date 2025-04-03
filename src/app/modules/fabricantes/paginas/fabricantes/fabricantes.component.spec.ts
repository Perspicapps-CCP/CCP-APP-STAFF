import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FabricantesComponent } from './fabricantes.component';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { FabricantesService } from '../../servicios/fabricantes.service';
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
import { CrearFabricanteComponent } from '../../componentes/crear-fabricante/crear-fabricante.component';
import { AgregarProductoFabricanteComponent } from '../../componentes/agregar-producto-fabricante/agregar-producto-fabricante.component';
import { Fabricante } from '../../interfaces/fabricantes.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

// Interfaces para la respuesta de carga masiva
interface MasivoProductoResponse {
  total_successful_records: number;
  total_errors_records: number;
  detail: Detail[];
}

interface Detail {
  row_file: number;
  detail: string;
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

// Mock del servicio de fabricantes
class MockFabricantesService {
  obtenerFabricantes() {
    return of<Fabricante[]>([
      {
        id: '423b3d2c-bc23-4892-8022-0ee081803d19',
        manufacturer_name: 'Percy Aufderhar',
        identification_type: 'CE',
        identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
        address: '7631 Lucio Lakes',
        contact_phone: '2899994000',
        email: 'Faye20@hotmail.com',
      },
      {
        id: '0df4f543-81af-46d7-8ba4-5a229dbcce7e',
        manufacturer_name: 'Cassandra Mertz',
        identification_type: 'CC',
        identification_number: '4236a0c5-0964-43da-8ec8-003f3eaac1f3',
        address: '215 McKenzie Causeway',
        contact_phone: '6299090284',
        email: 'Dessie_Bednar@yahoo.com',
      },
    ]);
  }

  cargaMasivaProductosFabricante(fabricante: Fabricante, file: File) {
    return of<MasivoProductoResponse>({
      total_successful_records: 10,
      total_errors_records: 0,
      detail: [],
    });
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: Fabricante[], searchTerm: string) {
    return items.filter(item =>
      item.manufacturer_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
  // Agregar afterAllClosed como BehaviorSubject
  afterAllClosed = new BehaviorSubject<any>({});

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

describe('FabricantesComponent', () => {
  let component: FabricantesComponent;
  let fixture: ComponentFixture<FabricantesComponent>;
  let fabricantesService: FabricantesService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FabricantesComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: FabricantesService, useClass: MockFabricantesService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FabricantesComponent);
    component = fixture.componentInstance;
    fabricantesService = TestBed.inject(FabricantesService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Espiar métodos para verificar llamadas
    spyOn(fabricantesService, 'obtenerFabricantes').and.callThrough();
    spyOn(component, 'filterFabricantes').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();
    // Espiar el método obtenerFabricantes del componente
    spyOn(component, 'obtenerFabricantes').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los fabricantes al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(fabricantesService.obtenerFabricantes).toHaveBeenCalled();

    // Verificar que se establecieron los fabricantes
    expect(component.fabricantes.length).toBe(2);
    expect(component.fabricantes[0].manufacturer_name).toBe('Percy Aufderhar');
  });

  it('debería inicializar filterFabricantes$ correctamente', () => {
    // Verificar que se llamó al método filterFabricantes
    expect(component.filterFabricantes).toHaveBeenCalled();

    // Verificar que filterFabricantes$ está definido
    expect(component.filterFabricantes$).toBeDefined();
  });

  it('debería alternar la selección de fabricante al llamar toggleExpansion', () => {
    // Inicialmente ningún fabricante está seleccionado
    expect(component.fabricanteSelected).toBeNull();

    // Seleccionar un fabricante
    const fabricante: Fabricante = {
      id: '0df4f543-81af-46d7-8ba4-5a229dbcce7e',
      manufacturer_name: 'Cassandra Mertz',
      identification_type: 'CC',
      identification_number: '4236a0c5-0964-43da-8ec8-003f3eaac1f3',
      address: '215 McKenzie Causeway',
      contact_phone: '6299090284',
      email: 'Dessie_Bednar@yahoo.com',
    };
    component.toggleExpansion(fabricante);
    expect(component.fabricanteSelected).toBe(fabricante);

    // Volver a llamar al mismo fabricante debería deseleccionarlo
    component.toggleExpansion(fabricante);
    expect(component.fabricanteSelected).toBeNull();

    // Seleccionar otro fabricante después de tener uno seleccionado
    const otroFabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };
    component.toggleExpansion(fabricante);
    component.toggleExpansion(otroFabricante);
    expect(component.fabricanteSelected).toBe(otroFabricante);
  });

  it('debería filtrar fabricantes correctamente', () => {
    // Simular búsqueda
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaFabricantes.setValue('Fabricante 1');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('Fabricante 1');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  // Pruebas para los métodos de diálogo

  it('debería abrir el modal de crear fabricante y refrescar fabricantes al cerrar', () => {
    // Resetear el contador de llamadas a obtenerFabricantes para la prueba
    (component.obtenerFabricantes as jasmine.Spy).calls.reset();

    // Llamar al método
    component.abrirModalCrearFabricante();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(CrearFabricanteComponent, {
      width: '29.125rem',
    });

    // Simular que todos los diálogos se han cerrado
    (dialog as any).afterAllClosed.next({});

    // Verificar que se llamó a obtenerFabricantes después de cerrar el diálogo
    expect(component.obtenerFabricantes).toHaveBeenCalled();
  });

  it('debería abrir el modal para agregar productos a un fabricante', () => {
    // Crear un fabricante de prueba
    const fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Llamar al método
    component.abrirModalAgregarProductosFabricante(fabricante);

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(AgregarProductoFabricanteComponent, {
      width: '29.125rem',
      data: { ...fabricante },
    });
  });

  // Nuevas pruebas para el método cargaMasivaProductos
  it('debería manejar correctamente la carga exitosa de un archivo CSV sin errores', fakeAsync(() => {
    // Espiar el método cargaMasivaProductosFabricante del servicio
    spyOn(fabricantesService, 'cargaMasivaProductosFabricante').and.returnValue(
      of({
        total_successful_records: 10,
        total_errors_records: 0,
        detail: [],
      }),
    );

    // Espiar los métodos del servicio de traducción y snackbar
    spyOn(translateService, 'get').and.callThrough();
    spyOn(snackBar, 'open').and.callThrough();

    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Seleccionar el fabricante
    component.fabricanteSelected = fabricante;

    // Crear un archivo CSV mock
    const file = new File(['contenido del csv'], 'productos.csv', { type: 'text/csv' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as unknown as FileList;

    // Crear un evento mock
    const event = {
      target: {
        files: fileList,
      },
    } as any;

    // Elemento HTML input mock
    const cargaMasiva = document.createElement('input');

    // Resetear el contador de llamadas a obtenerFabricantes para la prueba
    (component.obtenerFabricantes as jasmine.Spy).calls.reset();

    // Llamar al método
    component.cargaMasivaProductos(event, cargaMasiva, fabricante);
    tick();

    // Verificar que se llamó al servicio con los parámetros correctos
    expect(fabricantesService.cargaMasivaProductosFabricante).toHaveBeenCalledWith(
      fabricante,
      file,
    );

    // Verificar que se solicitó la traducción del mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.TOAST.SUCCESS_FILE');

    // Verificar que se mostró el snackbar
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se refrescaron los fabricantes
    expect(component.obtenerFabricantes).toHaveBeenCalled();

    // Verificar que se limpió el input
    expect(cargaMasiva.value).toBe('');

    // Verificar que se deseleccionó el fabricante
    expect(component.fabricanteSelected).toBeNull();
  }));

  it('debería manejar correctamente la carga de un archivo CSV con errores', fakeAsync(() => {
    // Mock de respuesta con errores
    const errorResponse: MasivoProductoResponse = {
      total_successful_records: 8,
      total_errors_records: 2,
      detail: [
        { row_file: 3, detail: 'Campo requerido faltante' },
        { row_file: 5, detail: 'Formato inválido' },
      ],
    };

    // Espiar el método cargaMasivaProductosFabricante del servicio
    spyOn(fabricantesService, 'cargaMasivaProductosFabricante').and.returnValue(of(errorResponse));

    // Espiar los métodos del snackbar
    spyOn(snackBar, 'open').and.callThrough();

    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Seleccionar el fabricante
    component.fabricanteSelected = fabricante;

    // Crear un archivo CSV mock
    const file = new File(['contenido del csv'], 'productos.csv', { type: 'text/csv' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as unknown as FileList;

    // Crear un evento mock
    const event = {
      target: {
        files: fileList,
      },
    } as any;

    // Elemento HTML input mock
    const cargaMasiva = document.createElement('input');

    // Resetear el contador de llamadas a obtenerFabricantes para la prueba
    (component.obtenerFabricantes as jasmine.Spy).calls.reset();

    // Llamar al método
    component.cargaMasivaProductos(event, cargaMasiva, fabricante);
    tick();

    // Verificar que se llamó al servicio con los parámetros correctos
    expect(fabricantesService.cargaMasivaProductosFabricante).toHaveBeenCalledWith(
      fabricante,
      file,
    );

    // Verificar que se mostró el snackbar con los mensajes de error
    expect(snackBar.open).toHaveBeenCalledWith(
      jasmine.stringContaining('3: Campo requerido faltante'),
      '',
      jasmine.objectContaining({
        horizontalPosition: 'end',
        verticalPosition: 'top',
        duration: 5000,
        panelClass: ['multiline-snackbar'],
      }),
    );

    // Verificar que se refrescaron los fabricantes
    expect(component.obtenerFabricantes).toHaveBeenCalled();

    // Verificar que se limpió el input
    expect(cargaMasiva.value).toBe('');

    // Verificar que se deseleccionó el fabricante
    expect(component.fabricanteSelected).toBeNull();
  }));

  it('debería rechazar archivos que no sean CSV', fakeAsync(() => {
    // Espiar los métodos relevantes
    spyOn(fabricantesService, 'cargaMasivaProductosFabricante').and.callThrough();
    spyOn(translateService, 'get').and.callThrough();
    spyOn(snackBar, 'open').and.callThrough();

    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Seleccionar el fabricante
    component.fabricanteSelected = fabricante;

    // Crear un archivo que NO es CSV
    const file = new File(['contenido del archivo'], 'productos.txt', { type: 'text/plain' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as unknown as FileList;

    // Crear un evento mock
    const event = {
      target: {
        files: fileList,
      },
    } as any;

    // Elemento HTML input mock
    const cargaMasiva = document.createElement('input');

    // Llamar al método
    component.cargaMasivaProductos(event, cargaMasiva, fabricante);
    tick();

    // Verificar que NO se llamó al servicio
    expect(fabricantesService.cargaMasivaProductosFabricante).not.toHaveBeenCalled();

    // Verificar que se solicitó la traducción del mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.TOAST.ERROR_SCV_FILE');

    // Verificar que se mostró el snackbar
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se deseleccionó el fabricante (ahora debe ser null como se actualizó en el código)
    expect(component.fabricanteSelected).toBeNull();

    // Verificar que se limpió el input
    expect(cargaMasiva.value).toBe('');
  }));

  it('debería manejar errores del servicio durante la carga de archivos', fakeAsync(() => {
    // Espiar los métodos relevantes
    spyOn(fabricantesService, 'cargaMasivaProductosFabricante').and.returnValue(
      throwError(() => new Error('Error al cargar el archivo')),
    );
    spyOn(translateService, 'get').and.callThrough();
    spyOn(snackBar, 'open').and.callThrough();
    spyOn(console, 'error').and.callThrough();

    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Seleccionar el fabricante
    component.fabricanteSelected = fabricante;

    // Crear un archivo CSV mock
    const file = new File(['contenido del csv'], 'productos.csv', { type: 'text/csv' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as unknown as FileList;

    // Crear un evento mock
    const event = {
      target: {
        files: fileList,
      },
    } as any;

    // Elemento HTML input mock
    const cargaMasiva = document.createElement('input');

    // Llamar al método
    component.cargaMasivaProductos(event, cargaMasiva, fabricante);
    tick();

    // Verificar que se llamó al servicio con los parámetros correctos
    expect(fabricantesService.cargaMasivaProductosFabricante).toHaveBeenCalledWith(
      fabricante,
      file,
    );

    // Verificar que se registró el error en la consola
    expect(console.error).toHaveBeenCalled();

    // Verificar que se solicitó la traducción del mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.TOAST.ERROR_FILE');

    // Verificar que se mostró el snackbar
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se limpió el input
    expect(cargaMasiva.value).toBe('');

    // Verificar que se deseleccionó el fabricante
    expect(component.fabricanteSelected).toBeNull();
  }));

  it('no debería hacer nada si no se selecciona ningún archivo', fakeAsync(() => {
    // Espiar los métodos relevantes
    spyOn(fabricantesService, 'cargaMasivaProductosFabricante').and.callThrough();
    spyOn(translateService, 'get').and.callThrough();
    spyOn(snackBar, 'open').and.callThrough();

    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Crear un evento mock sin archivos
    const event = {
      target: {
        files: null,
      },
    } as any;

    // Elemento HTML input mock
    const cargaMasiva = document.createElement('input');

    // Llamar al método
    component.cargaMasivaProductos(event, cargaMasiva, fabricante);
    tick();

    // Verificar que no se llamó al servicio
    expect(fabricantesService.cargaMasivaProductosFabricante).not.toHaveBeenCalled();

    // Verificar que no se solicitó traducción
    expect(translateService.get).not.toHaveBeenCalled();

    // Verificar que no se mostró el snackbar
    expect(snackBar.open).not.toHaveBeenCalled();

    // Verificar que se limpió el input
    expect(cargaMasiva.value).toBe('');

    // Verificar que se deseleccionó el fabricante
    expect(component.fabricanteSelected).toBeNull();
  }));
});

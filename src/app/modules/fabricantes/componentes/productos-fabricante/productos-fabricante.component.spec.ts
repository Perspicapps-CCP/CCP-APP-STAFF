import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  TranslateModule,
  TranslateLoader,
  TranslateFakeLoader,
  TranslateService,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core';

import { ProductosFabricanteComponent } from './productos-fabricante.component';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ProductoFabricante } from '../../interfaces/producto-fabricante.interface';
import { ProductoFabricanteImageResponse } from '../../interfaces/producto-fabricante-image-response';

// Mock mejorado para LocalizationService
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

// Helper function to convert File[] to FileList
function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

describe('ProductosFabricanteComponent', () => {
  let component: ProductosFabricanteComponent;
  let fixture: ComponentFixture<ProductosFabricanteComponent>;

  // Mocks para los servicios
  const fabricantesServiceMock = {
    obtenerProductosFabricante: jasmine.createSpy('obtenerProductosFabricante').and.returnValue(
      of<ProductoFabricante[]>([
        { id: '1', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: ['10.5'] },
        {
          id: '2',
          name: 'Producto 2',
          product_code: 'abc123',
          price: 20.75,
          images: ['20.75'],
        },
      ]),
    ),
    cargarImagenesProducto: jasmine.createSpy('cargarImagenesProducto').and.returnValue(
      of<ProductoFabricanteImageResponse>({
        operation_id: 'op123',
        product_id: '1',
        processed_records: 5,
        successful_records: 4,
        failed_records: 1,
        created_at: new Date(),
      }),
    ),
  };

  const dinamicSearchServiceMock = {
    dynamicSearch: jasmine
      .createSpy('dynamicSearch')
      .and.callFake((items: ProductoFabricante[], searchTerm) => {
        return items.filter((item: { name: string }) => item.name.includes(searchTerm as string));
      }),
  };

  const dialogMock = {
    open: jasmine.createSpy('open'),
  };

  registerLocaleData(localeEs);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        HighlightTextPipe,
        LocalCurrencyPipe,
      ],
      providers: [
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: DinamicSearchService, useValue: dinamicSearchServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        TranslateService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosFabricanteComponent);
    component = fixture.componentInstance;

    // Establecer el Input requerido
    component.fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '289.999.4000',
      email: 'Faye20@hotmail.com',
      expandido: false,
    };

    // Llamar a ngOnInit explícitamente (ya que el ciclo de vida podría no ejecutarse automáticamente en pruebas)
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para el método buscar que usa el servicio de búsqueda dinámica
  it('debería filtrar productos utilizando el servicio de búsqueda dinámica', () => {
    // Configurar el componente con productos
    component.productos = [
      { id: '1', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: ['10.5'] },
      { id: '2', name: 'Producto 2', product_code: 'abc123', price: 20.75, images: ['20.75'] },
    ];

    // Probar el método buscar con un término de búsqueda
    const terminoBusqueda = 'Producto 1';
    const resultado = component.buscar(terminoBusqueda);

    // Verificar que se llamó al servicio de búsqueda dinámica
    expect(dinamicSearchServiceMock.dynamicSearch).toHaveBeenCalledWith(
      component.productos,
      terminoBusqueda,
    );
  });

  // Prueba para el método abrirVisorImagenes
  it('debería abrir el visor de imágenes con el producto seleccionado', () => {
    // Crear un producto de prueba
    const productoSeleccionado = {
      id: 'b9830b3f-e507-44e3-bec0-8416c68c2047',
      name: 'Shirt',
      product_code: '978-1-0365-2066-3',
      price: 3360.1,
      images: ['original_image.jpg', 'thumbnail_image.jpg'],
    };

    // Llamar al método abrirVisorImagenes
    component.abrirVisorImagenes(productoSeleccionado);

    // Verificar que se llamó al diálogo con los parámetros correctos
    expect(dialogMock.open).toHaveBeenCalledWith(VisorImagenesDialogComponent, {
      data: productoSeleccionado,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  });

  it('debería validar que los archivos sean imágenes', () => {
    // Obtener una referencia al TranslateService
    const translateService = TestBed.inject(TranslateService);

    // Spy para el método get del TranslateService
    spyOn(translateService, 'get')
      .withArgs('FABRICANTES.TOAST.ERROR_IMAGE_FILE')
      .and.returnValue(of('Los archivos deben ser imágenes'));

    // Spy para el método open del MatSnackBar
    const snackBarSpy = spyOn(component['_snackBar'], 'open');

    // Crear un evento con un archivo que no es una imagen
    const fileList = createFileList([new File([''], 'test.txt', { type: 'text/plain' })]);
    const event = { target: { files: fileList } } as unknown as Event;
    const inputElement = document.createElement('input');

    // Preparar producto y fabricante para la prueba
    const producto: ProductoFabricante = {
      id: '1',
      name: 'Producto Test',
      product_code: 'ABC123',
      price: 100,
      images: [],
    };

    // Ejecutar el método
    component.cargarImagenes(event, inputElement, producto);

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.TOAST.ERROR_IMAGE_FILE');
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toBe('Los archivos deben ser imágenes');
  });

  // 2. Para el test de procesamiento correcto (modificado para no usar overrideProvider)
  it('debería procesar correctamente imágenes válidas', () => {
    // Obtener el servicio y hacer reset de llamadas previas
    const fabricantesService = TestBed.inject(FabricantesService);
    (fabricantesService.cargarImagenesProducto as jasmine.Spy).calls.reset();

    // Obtener una referencia al TranslateService
    const translateService = TestBed.inject(TranslateService);

    // Spy para el método get del TranslateService
    spyOn(translateService, 'get')
      .withArgs('BODEGAS.PRODUCTOS_BODEGA.TOAST.MASSIVE_PRODUCTS_IMAGE_PROCESSED', {
        count: 5,
        countOk: 4,
        countError: 1,
      })
      .and.returnValue(of('5 imágenes procesadas: 4 correctas, 1 con errores'));

    // Spy para el método open del MatSnackBar
    const snackBarSpy = spyOn(component['_snackBar'], 'open');

    // Spy para el método obtenerProductosFabricantes
    spyOn(component, 'obtenerProductosFabricantes');

    // Convert File[] to FileList
    const fileList = createFileList([
      new File([''], 'image1.jpg', { type: 'image/jpeg' }),
      new File([''], 'image2.png', { type: 'image/png' }),
    ]);
    const event = { target: { files: fileList } } as unknown as Event;
    const inputElement = document.createElement('input');

    // Preparar producto para la prueba
    const producto: ProductoFabricante = {
      id: '1',
      name: 'Producto Test',
      product_code: 'ABC123',
      price: 100,
      images: [],
    };

    // Ejecutar el método
    component.cargarImagenes(event, inputElement, producto);

    // Verificar que se llamó al servicio con los parámetros correctos
    expect(fabricantesService.cargarImagenesProducto).toHaveBeenCalledWith(
      component.fabricante,
      producto,
      fileList,
    );

    // Verificar que se mostró el mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith(
      'BODEGAS.PRODUCTOS_BODEGA.TOAST.MASSIVE_PRODUCTS_IMAGE_PROCESSED',
      { count: 5, countOk: 4, countError: 1 },
    );
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toBe(
      '5 imágenes procesadas: 4 correctas, 1 con errores',
    );

    // Verificar que se recargan los productos
    expect(component.obtenerProductosFabricantes).toHaveBeenCalled();

    // Verificar que se limpia el input
    expect(inputElement.value).toBe('');
  });

  // 3. Para el test de manejo de errores (modificado para no usar overrideProvider)
  it('debería manejar errores durante el procesamiento de imágenes', () => {
    // Obtener el servicio
    const fabricantesService = TestBed.inject(FabricantesService);

    // Guardar el comportamiento original
    const originalBehavior = (fabricantesService.cargarImagenesProducto as jasmine.Spy).and
      .callFake;

    // Modificar temporalmente para devolver error
    (fabricantesService.cargarImagenesProducto as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Error al procesar imágenes')),
    );

    // Obtener una referencia al TranslateService
    const translateService = TestBed.inject(TranslateService);

    // Spy para el método get del TranslateService
    spyOn(translateService, 'get')
      .withArgs('BODEGAS.PRODUCTOS_BODEGA.TOAST.ERROR_PROCESS_MASIVE_IMAGE')
      .and.returnValue(of('Error al procesar las imágenes'));

    // Spy para el método open del MatSnackBar
    const snackBarSpy = spyOn(component['_snackBar'], 'open');

    // Convert File[] to FileList
    const fileList = createFileList([new File([''], 'image1.jpg', { type: 'image/jpeg' })]);
    const event = { target: { files: fileList } } as unknown as Event;
    const inputElement = document.createElement('input');

    // Preparar producto para la prueba
    const producto: ProductoFabricante = {
      id: '1',
      name: 'Producto Test',
      product_code: 'ABC123',
      price: 100,
      images: [],
    };

    // Ejecutar el método
    component.cargarImagenes(event, inputElement, producto);

    // Verificar que se llamó al servicio
    expect(fabricantesService.cargarImagenesProducto).toHaveBeenCalled();

    // Verificar que se mostró el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith(
      'BODEGAS.PRODUCTOS_BODEGA.TOAST.ERROR_PROCESS_MASIVE_IMAGE',
    );
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toBe('Error al procesar las imágenes');

    // Verificar que se limpia el input
    expect(inputElement.value).toBe('');

    // Restaurar el comportamiento original
    (fabricantesService.cargarImagenesProducto as jasmine.Spy).and.returnValue(
      of({
        operation_id: 'op123',
        product_id: '1',
        processed_records: 5,
        successful_records: 4,
        failed_records: 1,
        created_at: new Date(),
      }),
    );
  });

  // 4. Para el test de ningún archivo seleccionado (corregido)
  it('no debería hacer nada si no se selecciona ningún archivo', () => {
    // Obtener el servicio
    const fabricantesService = TestBed.inject(FabricantesService);

    // Verificar que el spy existe y tiene calls antes de resetear
    if (
      fabricantesService.cargarImagenesProducto &&
      (fabricantesService.cargarImagenesProducto as jasmine.Spy).calls
    ) {
      (fabricantesService.cargarImagenesProducto as jasmine.Spy).calls.reset();
    } else {
      // Si no tiene el método o no es un spy, asegurarnos de que existe
      fabricantesService.cargarImagenesProducto = jasmine.createSpy('cargarImagenesProducto');
    }

    // Crear un evento sin archivos
    const event = { target: { files: null } } as unknown as Event;
    const inputElement = document.createElement('input');

    // Preparar producto para la prueba
    const producto: ProductoFabricante = {
      id: '1',
      name: 'Producto Test',
      product_code: 'ABC123',
      price: 100,
      images: [],
    };

    // Ejecutar el método
    component.cargarImagenes(event, inputElement, producto);

    // Verificar que no se llamó al servicio
    expect(fabricantesService.cargarImagenesProducto).not.toHaveBeenCalled();
  });
});

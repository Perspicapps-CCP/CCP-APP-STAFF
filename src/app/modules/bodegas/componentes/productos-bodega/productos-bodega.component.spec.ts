import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosBodegaComponent } from './productos-bodega.component';
import { BehaviorSubject, of } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { BodegasService } from '../../servicios/bodegas.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { LOCALE_ID } from '@angular/core';
import { ProductoBodega } from '../../interfaces/producto-bodega';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';

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

describe('ProductosBodegaComponent', () => {
  let component: ProductosBodegaComponent;
  let fixture: ComponentFixture<ProductosBodegaComponent>;

  const bodegasServiceMock = {
    obtenerProductosBodega: jasmine.createSpy('obtenerProductosBodega').and.returnValue(
      of<ProductoBodega[]>([
        {
          id: '1',
          name: 'Producto 1',
          product_code: 'abc123',
          price: 10.5,
          images: ['image1.jpg'],
          quantity: '10',
        },
        {
          id: '2',
          name: 'Producto 2',
          product_code: 'xyz456',
          price: 20.75,
          images: ['image2.jpg'],
          quantity: '20',
        },
      ]),
    ),
  };

  const dinamicSearchServiceMock = {
    dynamicSearch: jasmine
      .createSpy('dynamicSearch')
      .and.callFake((items: ProductoBodega[], searchTerm) => {
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
        ProductosBodegaComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        HighlightTextPipe,
        LocalCurrencyPipe,
      ],
      providers: [
        { provide: BodegasService, useValue: bodegasServiceMock },
        { provide: DinamicSearchService, useValue: dinamicSearchServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosBodegaComponent);
    component = fixture.componentInstance;
    // Establecer el Input requerido
    component.bodega = {
      warehouse_id: '1',
      warehouse_name: 'Almacén Principal',
      country: 'España',
      city: 'Madrid',
      address: 'Calle Test 123',
      phone: '123456789',
    };

    // Llamar a ngOnInit explícitamente (ya que el ciclo de vida podría no ejecutarse automáticamente en pruebas)
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter products when form control value changes', () => {
    spyOn(component, 'buscar').and.callThrough();

    // Simular cambio en el control del formulario
    component.formBusquedaProductos.setValue('Producto 2');

    expect(component.buscar).toHaveBeenCalledWith('Producto 2');
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

  it('should show notification when trying to add a product', () => {
    // Crear un spy para el snackBar.open
    const snackBarSpy = spyOn(component['_snackBar'], 'open').and.callThrough();

    // Configurar el translate service para retornar un mensaje cuando se solicite 'SETTINGS.NOT_IMPLEMENTED_YET'
    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'get')
      .withArgs('SETTINGS.NOT_IMPLEMENTED_YET')
      .and.returnValue(of('Funcionalidad no implementada aún'));

    // Llamar al método que queremos probar
    component.abrirModalAgregarProductoBodega();

    // Verificar que se llamó al método get del translateService con la clave correcta
    expect(translateService.get).toHaveBeenCalledWith('SETTINGS.NOT_IMPLEMENTED_YET');

    // Verificar que se llamó al método open del snackBar con el mensaje traducido
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toBe('Funcionalidad no implementada aún');
    expect(snackBarSpy.calls.mostRecent().args[1]).toBe('');

    // Verificar las configuraciones del snackBar
    const snackBarArgs = snackBarSpy.calls.mostRecent().args[2];
    if (snackBarArgs) {
      expect(snackBarArgs.horizontalPosition).toBe('end');
      expect(snackBarArgs.verticalPosition).toBe('top');
      expect(snackBarArgs.duration).toBe(3000);
    }
  });
});

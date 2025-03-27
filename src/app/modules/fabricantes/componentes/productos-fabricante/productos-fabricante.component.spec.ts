import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
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

// Mock mejorado para LocalizationService
class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() { return 'es-ES'; }
  getLang() { return 'es'; }
  getCurrencyCode() { return 'EUR'; }
}

describe('ProductosFabricanteComponent', () => {
  let component: ProductosFabricanteComponent;
  let fixture: ComponentFixture<ProductosFabricanteComponent>;

  // Mocks para los servicios
  const fabricantesServiceMock = {
    obtenerProductosFabricante: jasmine.createSpy('obtenerProductosFabricante').and.returnValue(of<ProductoFabricante[]>([
      { id: '1', name: 'Producto 1', product_code: 'abc123', unit_cost: 10.5, images: ['10.5'] },
      { id: '2', name: 'Producto 2', product_code: 'abc123', unit_cost: 20.75, images: ['20.75'] }
    ]))
  };

  const dinamicSearchServiceMock = {
    dynamicSearch: jasmine.createSpy('dynamicSearch').and.callFake((items: ProductoFabricante[], searchTerm) => {
      return items.filter((item: { name: string }) => item.name.includes(searchTerm as string));
    })
  };

  const dialogMock = {
    open: jasmine.createSpy('open')
  };

  registerLocaleData(localeEs);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        HighlightTextPipe,
        LocalCurrencyPipe
      ],
      providers: [
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: DinamicSearchService, useValue: dinamicSearchServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        TranslateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductosFabricanteComponent);
    component = fixture.componentInstance;

    // Establecer el Input requerido
    component.fabricante = {
      id: "423b3d2c-bc23-4892-8022-0ee081803d19",
      manufacturer_name: "Percy Aufderhar",
      identification_type: "CE",
      identification_number: "27d90e27-970a-41e7-83c1-7e6402296a51",
      address: "7631 Lucio Lakes",
      contact_phone: "289.999.4000",
      email: "Faye20@hotmail.com",
      expandido: false
    }

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
      { id: '1', name: 'Producto 1', product_code: 'abc123', unit_cost: 10.5, images: ['10.5'] },
      { id: '2', name: 'Producto 2', product_code: 'abc123', unit_cost: 20.75, images: ['20.75'] }
    ];

    // Probar el método buscar con un término de búsqueda
    const terminoBusqueda = 'Producto 1';
    const resultado = component.buscar(terminoBusqueda);

    // Verificar que se llamó al servicio de búsqueda dinámica
    expect(dinamicSearchServiceMock.dynamicSearch).toHaveBeenCalledWith(component.productos, terminoBusqueda);
  });

  // Prueba para el método abrirVisorImagenes
  it('debería abrir el visor de imágenes con el producto seleccionado', () => {
    // Crear un producto de prueba
    const productoSeleccionado = {
      id: "b9830b3f-e507-44e3-bec0-8416c68c2047",
      name: "Shirt",
      product_code: "978-1-0365-2066-3",
      unit_cost: 3360.1,
      images: ['original_image.jpg', 'thumbnail_image.jpg']
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
});

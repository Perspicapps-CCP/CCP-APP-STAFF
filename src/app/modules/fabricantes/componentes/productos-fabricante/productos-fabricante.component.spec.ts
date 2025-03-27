import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ProductosFabricanteComponent } from './productos-fabricante.component';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { LocalizationService } from '../../../../shared/servicios/localization.service';

// Mock mejorado para LocalizationService
export class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({
    decimal: ',',
    thousands: '.',
    grouping: [3],
    currency: ['€', ''],
    dateTime: '%a %d %b %Y %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'],
    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    shortDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  });
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES').asObservable();

  formatNumberFactory = jasmine.createSpy('formatNumberFactory').and.returnValue(
    (value: number) => value.toLocaleString('es-ES')
  );

  initializeLanguage = jasmine.createSpy('initializeLanguage');

  getLocale() { return 'es-ES'; }
  getLang() { return 'es'; }
  getCurrencyCode() { return 'EUR'; }
  formatCurrency(value: any) { return `€${value}`; }
  formatNumber(value: any) { return value.toLocaleString('es-ES'); }
  formatDate(value: any) { return new Date(value).toLocaleDateString('es-ES'); }
}

describe('ProductosFabricanteComponent', () => {
  let component: ProductosFabricanteComponent;
  let fixture: ComponentFixture<ProductosFabricanteComponent>;

  // Mocks para los servicios
  const fabricantesServiceMock = {
    obtenerProductosFabricante: jasmine.createSpy('obtenerProductosFabricante').and.returnValue(of([
      { id: '1', nombre: 'Producto 1', codigoProducto: 'abc123', costoUnidad: 10.5, imagenes: ['10.5'] },
      { id: '2', nombre: 'Producto 2', codigoProducto: 'abc123', costoUnidad: 20.75, imagenes: ['20.75'] }
    ]))
  };

  const dinamicSearchServiceMock = {
    dynamicSearch: jasmine.createSpy('dynamicSearch').and.callFake((items, searchTerm) => {
      return items.filter((item: { nombre: string }) => item.nombre.includes(searchTerm as string));
    })
  };

  const dialogMock = {
    open: jasmine.createSpy('open')
  };

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
        TranslateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductosFabricanteComponent);
    component = fixture.componentInstance;

    // Establecer el Input requerido
    component.fabricante = {
      id: '1',
      nombre: 'Test Fabricante',
      identificacion: '123456',
      telefono: '555-1234',
      direccion: 'Calle Test 123',
      correo: 'test@fabricante.com',
      productos: [],
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
      { id: '1', nombre: 'Producto 1', codigoProducto: 'abc123', costoUnidad: 10.5, imagenes: ['10.5'] },
      { id: '2', nombre: 'Producto 2', codigoProducto: 'abc123', costoUnidad: 20.75, imagenes: ['20.75'] }
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
      id: '1',
      nombre: 'Producto 1',
      codigoProducto: 'abc123',
      costoUnidad: 10.5,
      imagenes: ['10.5']
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

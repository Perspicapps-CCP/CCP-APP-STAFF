import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FiltrarVentasComponent } from './filtrar-ventas.component';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { VentaQuery } from '../../interfaces/ventas.interface';

describe('FiltrarVentasComponent', () => {
  let component: FiltrarVentasComponent;
  let fixture: ComponentFixture<FiltrarVentasComponent>;
  let vendedoresService: VendedoresService;
  let dialogRef: MatDialogRef<FiltrarVentasComponent>;
  let translateService: TranslateService;

  // Mock data
  const mockVendedores: Vendedor[] = [
    {
      id: '1',
      full_name: 'Vendedor Test',
      email: 'vendedor@test.com',
      id_type: 'CC',
      identification: '123456789',
      phone: '3001234567',
      username: 'vendedor1',
      role: 'vendedor',
    },
    {
      id: '2',
      full_name: 'Vendedor Test 2',
      email: 'vendedor2@test.com',
      id_type: 'CC',
      identification: '987654321',
      phone: '3007654321',
      username: 'vendedor2',
      role: 'vendedor',
    },
  ];

  // Crear mocks para los servicios
  const vendedoresServiceMock = {
    obtenerVendedores: jasmine.createSpy('obtenerVendedores').and.returnValue(of(mockVendedores)),
  };

  const matDialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  const translateServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of('mensaje traducido')),
    instant: jasmine.createSpy('instant').and.returnValue('mensaje traducido'),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({}),
    getBrowserLang: () => 'es',
    currentLang: 'es',
    use: jasmine.createSpy('use').and.returnValue(of({})),
    setDefaultLang: jasmine.createSpy('setDefaultLang'),
    addLangs: jasmine.createSpy('addLangs'),
    getLangs: jasmine.createSpy('getLangs').and.returnValue(['es', 'en']),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        NgbTypeaheadModule,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Esto permite ignorar elementos no reconocidos en templates
      providers: [
        { provide: VendedoresService, useValue: vendedoresServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    })
      .overrideComponent(FiltrarVentasComponent, {
        set: {
          // Sustituimos el template completo para evitar problemas con el componente de calendario
          template: `<div>Mocked Template for Testing</div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FiltrarVentasComponent);
    component = fixture.componentInstance;
    vendedoresService = TestBed.inject(VendedoresService);
    dialogRef = TestBed.inject(MatDialogRef);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    vendedoresServiceMock.obtenerVendedores.calls.reset();
    matDialogRefMock.close.calls.reset();

    // Configurar manualmente los datos necesarios
    component.sellers = mockVendedores;

    // Detectar cambios después de configurar todo
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba que se llamen a los servicios correctamente en ngOnInit
  it('should load sellers on init', () => {
    // Llamamos manualmente a ngOnInit para asegurar que se ejecuta
    component.ngOnInit();

    expect(vendedoresService.obtenerVendedores).toHaveBeenCalled();
    expect(component.sellers).toEqual(mockVendedores);
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with default values', () => {
    expect(component.filterForm).toBeDefined();
    expect(component.filterForm.get('seller')?.value).toBeNull();
    expect(component.filterForm.get('start_date')?.value).toBeNull();
    expect(component.filterForm.get('end_date')?.value).toBeNull();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const form = component.filterForm;
    form.get('seller')?.setErrors({ required: true });
    form.get('seller')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('seller');
    expect(errorMessage.key).toBe('VENTAS.FILTER_FORM.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método getErrorMessage con error 'fechaPasada'
  it('should return past date error message', () => {
    const form = component.filterForm;
    form.get('start_date')?.setErrors({ fechaPasada: true });
    form.get('start_date')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('start_date');
    expect(errorMessage.key).toBe('VENTAS.FILTER_FORM.FORM_ERRORS.DATE_PAST');
  });

  // Prueba para el método getErrorMessage con error 'fechaFinMenor'
  it('should return end date before start date error message', () => {
    const form = component.filterForm;
    form.get('end_date')?.setErrors({ fechaFinMenor: true });
    form.get('end_date')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('end_date');
    expect(errorMessage.key).toBe('VENTAS.FILTER_FORM.FORM_ERRORS.END_DATE_BEFORE_START_DATE');
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    const form = component.filterForm;
    form.get('start_date')?.setErrors({ fechaPasada: true });
    form.get('start_date')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('start_date')).toBeTruthy();

    // Cambiar a valor válido
    form.get('start_date')?.setErrors(null);
    expect(component.isInvalid('start_date')).toBeFalsy();
  });

  // Prueba para el método formatter del typeahead
  it('should format seller names correctly', () => {
    const seller = { full_name: 'Test Seller' };
    expect(component.formatter(seller)).toBe('Test Seller');
  });

  // Prueba para el método searchSellers
  it('should filter sellers correctly in searchSellers', fakeAsync(() => {
    // Crear un observable con el texto de búsqueda
    const text$ = of('Vendedor Test');

    // Obtener los resultados filtrados
    let results: readonly { full_name: string }[] = [];
    component.searchSellers(text$).subscribe(res => {
      results = res;
    });

    tick(200); // Esperar el debounceTime

    // Verificar que se filtran correctamente los vendedores
    expect(results.length).toBe(2); // Ambos vendedores tienen "Vendedor Test" en su nombre
    expect(results[0].full_name).toBe('Vendedor Test');
    expect(results[1].full_name).toBe('Vendedor Test 2');
  }));

  // Prueba para el método searchSellers con texto corto
  it('should return empty array for short search term', fakeAsync(() => {
    // Crear un observable con un texto de búsqueda corto
    const text$ = of('V');

    // Obtener los resultados filtrados
    let results: readonly { full_name: string }[] = [];
    component.searchSellers(text$).subscribe(res => {
      results = res;
    });

    tick(200); // Esperar el debounceTime

    // Verificar que no se devuelven resultados para un término corto
    expect(results.length).toBe(0);
  }));

  // Prueba para el método enviarFiltros con todos los filtros
  it('should send all filters when form is complete', () => {
    // Completar el formulario
    component.filterForm.setValue({
      seller: mockVendedores[0],
      start_date: '2023-01-01',
      end_date: '2023-01-31',
    });

    // Llamar al método
    component.enviarFiltros();

    // Verificar que se cierra el diálogo con los filtros correctos
    const expectedQuery: VentaQuery = {
      seller_id: '1',
      start_date: '2023-01-01',
      end_date: '2023-01-31',
    };
    expect(dialogRef.close).toHaveBeenCalledWith(expectedQuery);
  });

  // Prueba para el método enviarFiltros con filtros parciales
  it('should send partial filters when form is partially complete', () => {
    // Completar parcialmente el formulario
    component.filterForm.patchValue({
      seller: mockVendedores[0],
      // Sin fechas
    });

    // Llamar al método
    component.enviarFiltros();

    // Verificar que se cierra el diálogo con los filtros parciales
    const expectedQuery: VentaQuery = {
      seller_id: '1',
      start_date: undefined,
      end_date: undefined,
    };
    expect(dialogRef.close).toHaveBeenCalledWith(expectedQuery);
  });

  // Prueba para el método enviarFiltros sin filtros
  it('should send empty filters when form is empty', () => {
    // No completar el formulario (dejarlo con valores por defecto)

    // Llamar al método
    component.enviarFiltros();

    // Verificar que se cierra el diálogo con filtros vacíos
    const expectedQuery: VentaQuery = {
      seller_id: undefined,
      start_date: undefined,
      end_date: undefined,
    };
    expect(dialogRef.close).toHaveBeenCalledWith(expectedQuery);
  });
});

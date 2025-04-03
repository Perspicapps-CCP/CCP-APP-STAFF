import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbTypeaheadModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CrearPlanVentaComponent } from './crear-plan-venta.component';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { FabricantesService } from '../../../fabricantes/servicios/fabricantes.service';
import { PlanesService } from '../../servicios/planes.service';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { ProductoFabricante } from '../../../fabricantes/interfaces/producto-fabricante.interface';
import { PlanVentaPost } from '../../interfaces/planes.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { LocalizationService } from '../../../../shared/servicios/localization.service';

describe('CrearPlanVentaComponent', () => {
  let component: CrearPlanVentaComponent;
  let fixture: ComponentFixture<CrearPlanVentaComponent>;
  let vendedoresService: VendedoresService;
  let fabricantesService: FabricantesService;
  let planesService: PlanesService;
  let dialogRef: MatDialogRef<CrearPlanVentaComponent>;
  let snackBar: MatSnackBar;
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

  const mockProductos: ProductoFabricante[] = [
    {
      id: '1',
      name: 'Producto Test',
      product_code: 'PROD001',
      price: 100,
      images: [],
    },
    {
      id: '2',
      name: 'Producto Test 2',
      product_code: 'PROD002',
      price: 200,
      images: [],
    },
  ];

  // Crear mocks para los servicios
  const vendedoresServiceMock = {
    obtenerVendedores: jasmine.createSpy('obtenerVendedores').and.returnValue(of(mockVendedores)),
  };

  const fabricantesServiceMock = {
    obtenerProductos: jasmine.createSpy('obtenerProductos').and.returnValue(of(mockProductos)),
  };

  const planesServiceMock = {
    crearPlan: jasmine.createSpy('crearPlan').and.returnValue(of({})),
  };

  const matDialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  const snackBarMock = {
    open: jasmine.createSpy('open'),
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

  const localizationServiceMock = {
    initializeLanguage: jasmine.createSpy('initializeLanguage'),
    setLocalization: jasmine.createSpy('setLocalization'),
    getCurrentLanguage: jasmine.createSpy('getCurrentLanguage').and.returnValue('es'),
    getAvailableLanguages: jasmine.createSpy('getAvailableLanguages').and.returnValue(['es', 'en']),
  };

  const ngbDateParserFormatterMock = {
    parse: jasmine.createSpy('parse').and.callFake(value => value),
    format: jasmine
      .createSpy('format')
      .and.callFake(date => (date ? date.toISOString().split('T')[0] : '')),
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
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: PlanesService, useValue: planesServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: LocalizationService, useValue: localizationServiceMock },
        { provide: NgbDateParserFormatter, useValue: ngbDateParserFormatterMock },
      ],
    })
      .overrideComponent(CrearPlanVentaComponent, {
        set: {
          // Sustituimos el template completo para evitar problemas con el componente de calendario
          template: `<div>Mocked Template for Testing</div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CrearPlanVentaComponent);
    component = fixture.componentInstance;
    vendedoresService = TestBed.inject(VendedoresService);
    fabricantesService = TestBed.inject(FabricantesService);
    planesService = TestBed.inject(PlanesService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    vendedoresServiceMock.obtenerVendedores.calls.reset();
    fabricantesServiceMock.obtenerProductos.calls.reset();
    planesServiceMock.crearPlan.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    // Configurar manualmente los datos necesarios
    component.sellers = mockVendedores;
    component.productos = mockProductos;

    // Detectar cambios después de configurar todo
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba que se llamen a los servicios correctamente en ngOnInit
  it('should load sellers and products on init', () => {
    // Llamamos manualmente a ngOnInit para asegurar que se ejecuta
    component.ngOnInit();

    expect(vendedoresService.obtenerVendedores).toHaveBeenCalled();
    expect(fabricantesService.obtenerProductos).toHaveBeenCalled();
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with default values', () => {
    expect(component.planForm).toBeDefined();
    expect(component.planForm.get('product')?.value).toBeNull();
    expect(component.planForm.get('goal')?.value).toBe(1);
    expect(component.planForm.get('start_date')?.value).toBeNull();
    expect(component.planForm.get('end_date')?.value).toBeNull();
  });

  // Prueba para verificar la validación de campos requeridos
  it('should validate required fields', () => {
    const form = component.planForm;

    // Marcar los campos como touched para activar las validaciones
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });

    // Verificar que el formulario es inválido cuando los campos requeridos están vacíos
    expect(form.valid).toBeFalsy();

    // Completar el formulario con datos válidos
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    form.patchValue({
      product: mockProductos[0],
      goal: 10,
      start_date: today,
      end_date: nextWeek,
    });

    // Verificar que el formulario es válido con todos los campos completados
    expect(form.valid).toBeTruthy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const form = component.planForm;
    form.get('product')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('product');
    expect(errorMessage.key).toBe('PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método getErrorMessage con error 'min'
  it('should return min error message for goal', () => {
    const form = component.planForm;
    form.get('goal')?.setValue(0);
    form.get('goal')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('goal');
    expect(errorMessage.key).toBe('PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.GOAL_MIN');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(1);
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    const form = component.planForm;
    form.get('goal')?.setValue(0);
    form.get('goal')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('goal')).toBeTruthy();

    // Cambiar a valor válido
    form.get('goal')?.setValue(10);
    expect(component.isInvalid('goal')).toBeFalsy();
  });

  // Prueba para los métodos de selección de vendedores
  it('should handle seller selection correctly', () => {
    // Inicialmente ningún vendedor debería estar seleccionado
    expect(component.selectionSellers.selected.length).toBe(0);
    expect(component.isAllSelected()).toBeFalsy();

    // Seleccionar todos los vendedores
    component.toggleAllRows();
    expect(component.selectionSellers.selected.length).toBe(mockVendedores.length);
    expect(component.isAllSelected()).toBeTruthy();

    // Deseleccionar todos los vendedores
    component.toggleAllRows();
    expect(component.selectionSellers.selected.length).toBe(0);
    expect(component.isAllSelected()).toBeFalsy();

    // Verificar que el método checkboxLabel funciona correctamente
    expect(component.checkboxLabel()).toBe('select all');
    expect(component.checkboxLabel(mockVendedores[0])).toBe('select row vendedor1');

    // Seleccionar un vendedor específico
    component.selectionSellers.select(mockVendedores[0]);
    expect(component.selectionSellers.isSelected(mockVendedores[0])).toBeTruthy();
    expect(component.checkboxLabel(mockVendedores[0])).toBe('deselect row vendedor1');
  });

  // Prueba para el método formatter del typeahead
  it('should format product names correctly', () => {
    const product = { name: 'Test Product' };
    expect(component.formatter(product)).toBe('Test Product');
  });

  // Prueba para el método crearPlan con éxito
  it('should create a sales plan successfully', fakeAsync(() => {
    // Seleccionar vendedores
    component.selectionSellers.select(mockVendedores[0], mockVendedores[1]);

    // Completar el formulario
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    component.planForm.setValue({
      product: mockProductos[0],
      goal: 10,
      start_date: today,
      end_date: nextWeek,
    });

    // Llamar al método
    component.crearPlan();
    tick();

    // Verificar que el servicio fue llamado con los datos correctos
    expect(planesService.crearPlan).toHaveBeenCalled();
    const planExpected: PlanVentaPost = {
      product_id: mockProductos[0].id,
      goal: 10,
      start_date: today,
      end_date: nextWeek,
      seller_ids: [mockVendedores[0].id!, mockVendedores[1].id!],
    };
    expect(planesService.crearPlan).toHaveBeenCalledWith(jasmine.objectContaining(planExpected));

    // Verificar que se muestra el mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('PLAN_VENTA.CREAR_PLAN.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  // Prueba para el método crearPlan con error
  it('should handle error when creating a plan fails', fakeAsync(() => {
    // Configurar el mock para que devuelva un error
    planesServiceMock.crearPlan.and.returnValue(throwError(() => new Error('Error al crear plan')));

    // Seleccionar vendedores
    component.selectionSellers.select(mockVendedores[0]);

    // Completar el formulario
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    component.planForm.setValue({
      product: mockProductos[0],
      goal: 10,
      start_date: today,
      end_date: nextWeek,
    });

    // Llamar al método
    component.crearPlan();
    tick();

    // Verificar que el servicio fue llamado
    expect(planesService.crearPlan).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('PLAN_VENTA.CREAR_PLAN.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();

    // Restablecer el spy para las siguientes pruebas
    planesServiceMock.crearPlan.and.returnValue(of({}));
  }));

  // Prueba para el método crearPlan cuando no hay vendedores seleccionados
  it('should show error when no sellers are selected', fakeAsync(() => {
    // No seleccionar ningún vendedor
    component.selectionSellers.clear();

    // Completar el formulario
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    component.planForm.setValue({
      product: mockProductos[0],
      goal: 10,
      start_date: today,
      end_date: nextWeek,
    });

    // Llamar al método
    component.crearPlan();
    tick();

    // Verificar que el servicio NO fue llamado
    expect(planesService.crearPlan).not.toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error de vendedores
    expect(translateService.get).toHaveBeenCalledWith('PLAN_VENTA.CREAR_PLAN.TOAST.ERROR_SELLERS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que NO se cierra el diálogo
    expect(dialogRef.close).not.toHaveBeenCalled();
  }));
});

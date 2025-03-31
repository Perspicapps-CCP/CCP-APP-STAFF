import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { AgregarProductoFabricanteComponent } from './agregar-producto-fabricante.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Fabricante } from '../../interfaces/fabricantes.interface';

describe('AgregarProductoFabricanteComponent', () => {
  let component: AgregarProductoFabricanteComponent;
  let fixture: ComponentFixture<AgregarProductoFabricanteComponent>;
  let dialogRef: MatDialogRef<AgregarProductoFabricanteComponent>;
  let translateService: TranslateService;

  // Mock para el MatDialogRef
  const matDialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  // Mock para los datos del diálogo (MAT_DIALOG_DATA)
  const dialogDataMock: Fabricante = {
    manufacturer_name: 'Fabricante Test',
    identification_number: '123456789',
    contact_phone: '+57 3001234567',
    address: 'Calle 123 #45-67, Bogotá',
    email: 'contacto@fabricantetest.com',
    id: '1',
  };

  // Mock para el TranslateService
  const translateServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of('mensaje traducido')),
    instant: jasmine.createSpy('instant').and.returnValue('mensaje traducido'),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({}),
    getBrowserLang: () => 'es',
    currentLang: 'es',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AgregarProductoFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarProductoFabricanteComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    matDialogRefMock.close.calls.reset();
    translateServiceMock.get.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with empty fields', () => {
    expect(component.productoForm).toBeDefined();
    expect(component.productoForm.get('product_name')?.value).toBe('');
    expect(component.productoForm.get('product_code')?.value).toBe('');
    expect(component.productoForm.get('unit_cost')?.value).toBe('');
    expect(component.productoForm.get('images')?.value).toBeNull();
    expect(component.productoForm.get('images_text')?.value).toBe('');
  });

  // Prueba para verificar la validación de campos requeridos
  it('should validate required fields', () => {
    const form = component.productoForm;

    // Marcar los campos como touched para activar las validaciones
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });

    // Verificar que el formulario es inválido cuando está vacío
    expect(form.valid).toBeFalsy();

    // Simular un objeto File para images
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => mockFile,
      [Symbol.iterator]: function* () {
        yield mockFile;
      },
    } as unknown as FileList;

    // Completar el formulario con datos válidos
    form.patchValue({
      product_name: 'Producto Test',
      product_code: 'PROD001',
      unit_cost: '100',
      images: mockFileList,
      images_text: '1 archivo cargado',
    });

    // Verificar que el formulario es válido con todos los campos completados
    expect(form.valid).toBeTruthy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const form = component.productoForm;
    form.get('product_name')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('product_name');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método getErrorMessage con error 'minlength'
  it('should return minlength error message', () => {
    const form = component.productoForm;

    // Añadir un error minlength manualmente para probar
    const control = form.get('product_code');
    control?.setErrors({
      minlength: {
        requiredLength: 5,
        actualLength: 3,
      },
    });
    control?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('product_code');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(5);
  });

  // Prueba para el método getErrorMessage con error 'maxlength'
  it('should return maxlength error message', () => {
    const form = component.productoForm;

    // Añadir un error maxlength manualmente para probar
    const control = form.get('product_code');
    control?.setErrors({
      maxlength: {
        requiredLength: 10,
        actualLength: 15,
      },
    });
    control?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('product_code');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  it('should return empty error message for valid field', () => {
    const form = component.productoForm;
    form.get('product_code')?.setValue('Empresa Test');
    form.get('product_code')?.markAsTouched();

    // Verificar que no haya error para un campo válido
    const errorMessage = component.getErrorMessage('manufacturer_name');
    expect(errorMessage.key).toBe('');
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    const form = component.productoForm;

    // Campo requerido que no tiene valor
    form.get('product_name')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('product_name')).toBeTruthy();

    // Cambiar a valor válido
    form.get('product_name')?.setValue('Producto Test');
    expect(component.isInvalid('product_name')).toBeFalsy();
  });

  // Prueba para el método crearProducto
  it('should close dialog with form value when crearProducto is called', () => {
    const mockProducto = {
      product_name: 'Producto Test',
      product_code: 'PROD001',
      unit_cost: '100',
      images: null,
      images_text: '',
    };

    // Establecer valores en el formulario
    component.productoForm.patchValue(mockProducto);

    // Llamar al método
    component.crearProducto();

    // Verificar que se cierra el diálogo con los datos del formulario
    expect(dialogRef.close).toHaveBeenCalledWith(mockProducto);
  });

  // Prueba para el método onFileSelected con archivos seleccionados
  it('should handle file selection correctly when files are selected', fakeAsync(() => {
    // Crear un mock para el evento
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => mockFile,
      [Symbol.iterator]: function* () {
        yield mockFile;
      },
    } as unknown as FileList;

    const mockEvent = {
      target: {
        files: mockFileList,
      },
    };

    // Configurar el spy del translateService
    translateServiceMock.get.and.returnValue(of('archivos cargados'));

    // Llamar al método
    component.onFileSelected(mockEvent);
    tick();

    // Verificar que se llama al servicio de traducción
    expect(translateService.get).toHaveBeenCalledWith(
      'FABRICANTES.CREAR_PRODUCTO.FORM.IMAGES_CHARGED',
    );

    // Verificar que se actualizan los valores del formulario
    expect(component.productoForm.get('images')?.value).toBe(mockFileList);
    expect(component.productoForm.get('images_text')?.value).toBe('1 archivos cargados');
  }));

  // Prueba para el método onFileSelected sin archivos seleccionados
  it('should handle file selection correctly when no files are selected', () => {
    // Crear un mock para el evento sin archivos
    const mockEvent = {
      target: {
        files: {
          length: 0,
        },
      },
    };

    // Llamar al método
    component.onFileSelected(mockEvent);

    // Verificar que se reinician los valores del formulario
    expect(component.productoForm.get('images')?.value).toBeNull();
    expect(component.productoForm.get('images_text')?.value).toBeNull();

    // Verificar que se marcan como dirty y touched
    expect(component.productoForm.get('images_text')?.dirty).toBeTruthy();
    expect(component.productoForm.get('images_text')?.touched).toBeTruthy();
  });

  // Prueba para verificar la inyección de MAT_DIALOG_DATA
  it('should inject dialog data correctly', () => {
    expect(component.data).toBe(dialogDataMock);
  });
});

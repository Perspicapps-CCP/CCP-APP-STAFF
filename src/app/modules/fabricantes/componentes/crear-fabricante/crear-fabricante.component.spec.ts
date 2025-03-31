import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { CrearFabricanteComponent } from './crear-fabricante.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Fabricante } from '../../interfaces/fabricantes.interface';

describe('CrearFabricanteComponent', () => {
  let component: CrearFabricanteComponent;
  let fixture: ComponentFixture<CrearFabricanteComponent>;
  let fabricantesService: FabricantesService;
  let dialogRef: MatDialogRef<CrearFabricanteComponent>;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  // Crear mocks para los servicios
  const fabricantesServiceMock = {
    crearFabricante: jasmine.createSpy('crearFabricante').and.returnValue(of({})),
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CrearFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearFabricanteComponent);
    component = fixture.componentInstance;
    fabricantesService = TestBed.inject(FabricantesService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    fabricantesServiceMock.crearFabricante.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with empty fields', () => {
    expect(component.fabricanteForm).toBeDefined();
    expect(component.fabricanteForm.get('manufacturer_name')?.value).toBe('');
    expect(component.fabricanteForm.get('identification_type')?.value).toBe('');
    expect(component.fabricanteForm.get('identification_number')?.value).toBe('');
    expect(component.fabricanteForm.get('address')?.value).toBe('');
    expect(component.fabricanteForm.get('contact_phone')?.value).toBe('');
    expect(component.fabricanteForm.get('email')?.value).toBe('');
  });

  // Prueba para verificar la validación de campos requeridos
  it('should validate required fields', () => {
    const form = component.fabricanteForm;

    // Marcar los campos como touched para activar las validaciones
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });

    // Verificar que el formulario es inválido cuando está vacío
    expect(form.valid).toBeFalsy();

    // Completar el formulario con datos válidos
    form.patchValue({
      manufacturer_name: 'Empresa Test',
      identification_type: 'NIT',
      identification_number: '123456789',
      address: 'Calle Test 123',
      contact_phone: '1234567890',
      email: 'test@empresa.com',
    });

    // Verificar que el formulario es válido con todos los campos completados
    expect(form.valid).toBeTruthy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const form = component.fabricanteForm;
    form.get('manufacturer_name')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('manufacturer_name');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método getErrorMessage con error 'email'
  it('should return email error message for invalid email', () => {
    const form = component.fabricanteForm;
    form.get('email')?.setValue('invalid_email');
    form.get('email')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('email');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_EMAIL');
  });

  // Prueba para el método getErrorMessage con error 'minlength'
  it('should return minlength error message for contact_phone', () => {
    const form = component.fabricanteForm;
    form.get('contact_phone')?.setValue('12345');
    form.get('contact_phone')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('contact_phone');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  // Prueba para el método getErrorMessage con error 'maxlength'
  it('should return maxlength error message for contact_phone', () => {
    const form = component.fabricanteForm;
    form.get('contact_phone')?.setValue('12345678901234');
    form.get('contact_phone')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('contact_phone');
    expect(errorMessage.key).toBe('FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  it('should return empty error message for valid field', () => {
    const form = component.fabricanteForm;
    form.get('manufacturer_name')?.setValue('Empresa Test');
    form.get('manufacturer_name')?.markAsTouched();

    // Verificar que no haya error para un campo válido
    const errorMessage = component.getErrorMessage('manufacturer_name');
    expect(errorMessage.key).toBe('');
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    const form = component.fabricanteForm;
    form.get('email')?.setValue('invalid_email');
    form.get('email')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('email')).toBeTruthy();

    // Cambiar a valor válido
    form.get('email')?.setValue('valid@email.com');
    expect(component.isInvalid('email')).toBeFalsy();
  });

  // Prueba para el método crearFabricante con éxito
  it('should create a new manufacturer successfully', fakeAsync(() => {
    const mockFabricante = {
      manufacturer_name: 'Empresa Test',
      identification_type: 'NIT',
      identification_number: '123456789',
      address: 'Calle Test 123',
      contact_phone: '1234567890',
      email: 'test@empresa.com',
    };

    // Establecer valores en el formulario
    component.fabricanteForm.setValue(mockFabricante);

    // Llamar al método
    component.crearFabricante();
    tick();

    // Verificar que el servicio fue llamado con los datos correctos
    expect(fabricantesService.crearFabricante).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.CREAR_FABRICANTE.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  // Prueba para el método crearFabricante con error
  it('should handle error when creating a manufacturer fails', fakeAsync(() => {
    const mockFabricante = {
      manufacturer_name: 'Empresa Test',
      identification_type: 'NIT',
      identification_number: '123456789',
      address: 'Calle Test 123',
      contact_phone: '1234567890',
      email: 'test@empresa.com',
    };

    // Configurar el mock para que devuelva un error
    fabricantesServiceMock.crearFabricante.and.returnValue(
      throwError(() => new Error('Error al crear fabricante')),
    );

    // Establecer valores en el formulario
    component.fabricanteForm.setValue(mockFabricante);

    // Llamar al método
    component.crearFabricante();
    tick();

    // Verificar que el servicio fue llamado
    expect(fabricantesService.crearFabricante).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('FABRICANTES.CREAR_FABRICANTE.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();

    // Restablecer el spy para las siguientes pruebas
    fabricantesServiceMock.crearFabricante.and.returnValue(of({}));
  }));
});

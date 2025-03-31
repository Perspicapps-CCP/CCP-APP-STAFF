import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { VendedoresService } from '../../servicios/vendedores.service';
import { CrearVendedorComponent } from './crear-vendedor.component';

describe('CrearVendedorComponent', () => {
  let component: CrearVendedorComponent;
  let fixture: ComponentFixture<CrearVendedorComponent>;
  let vendedoresService: VendedoresService;
  let dialogRef: MatDialogRef<CrearVendedorComponent>;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  // Crear mocks para los servicios
  const vendedoresServiceMock = {
    crearVendedor: jasmine.createSpy('crearVendedor').and.returnValue(of({})),
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
        CrearVendedorComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: VendedoresService, useValue: vendedoresServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearVendedorComponent);
    component = fixture.componentInstance;
    vendedoresService = TestBed.inject(VendedoresService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    vendedoresServiceMock.crearVendedor.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with empty fields', () => {
    expect(component.vendedorForm).toBeDefined();
    expect(component.vendedorForm.get('full_name')?.value).toBe('');
    expect(component.vendedorForm.get('email')?.value).toBe('');
    expect(component.vendedorForm.get('id_type')?.value).toBe('');
    expect(component.vendedorForm.get('identification')?.value).toBe('');
    expect(component.vendedorForm.get('phone')?.value).toBe('');
    expect(component.vendedorForm.get('username')?.value).toBe('');
  });

  // Prueba para verificar la validación de campos requeridos
  it('should validate required fields', () => {
    const form = component.vendedorForm;

    // Marcar los campos como touched para activar las validaciones
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });

    // Verificar que el formulario es inválido cuando está vacío
    expect(form.valid).toBeFalsy();

    // Completar el formulario con datos válidos
    form.patchValue({
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      id_type: 'CC',
      identification: '12345678',
      phone: '3001234567',
      username: 'juanperez',
    });

    // Verificar que el formulario es válido con todos los campos completados
    expect(form.valid).toBeTruthy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const form = component.vendedorForm;
    form.get('full_name')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('full_name');
    expect(errorMessage.key).toBe('VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método getErrorMessage con error 'email'
  it('should return email error message for invalid email', () => {
    const form = component.vendedorForm;
    form.get('email')?.setValue('invalid_email');
    form.get('email')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('email');
    expect(errorMessage.key).toBe('VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_EMAIL');
  });

  // Prueba para el método getErrorMessage con error 'minlength'
  it('should return minlength error message for username', () => {
    const form = component.vendedorForm;
    form.get('username')?.setValue('ab'); // Menos de 3 caracteres (mínimo establecido)
    form.get('username')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('username');
    expect(errorMessage.key).toBe('VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(3);
  });

  // Prueba para el método getErrorMessage con error 'maxlength'
  it('should return maxlength error message for phone', () => {
    const form = component.vendedorForm;
    form.get('phone')?.setValue('12345678901234');
    form.get('phone')?.markAsTouched();

    // Verificar que el error sea el esperado
    const errorMessage = component.getErrorMessage('phone');
    expect(errorMessage.key).toBe('VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  it('should return empty error message for valid field', () => {
    const form = component.vendedorForm;
    form.get('username')?.setValue('Empresa Test');
    form.get('username')?.markAsTouched();

    // Verificar que no haya error para un campo válido
    const errorMessage = component.getErrorMessage('manufacturer_name');
    expect(errorMessage.key).toBe('');
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    const form = component.vendedorForm;
    form.get('email')?.setValue('invalid_email');
    form.get('email')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('email')).toBeTruthy();

    // Cambiar a valor válido
    form.get('email')?.setValue('valid@email.com');
    expect(component.isInvalid('email')).toBeFalsy();
  });

  // Prueba para el método crearVendedor con éxito
  it('should create a new vendedor successfully', fakeAsync(() => {
    const mockVendedor = {
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      id_type: 'CC',
      identification: '12345678',
      phone: '3001234567',
      username: 'juanperez',
    };

    // Establecer valores en el formulario
    component.vendedorForm.setValue(mockVendedor);

    // Llamar al método
    component.crearVendedor();
    tick();

    // Verificar que el servicio fue llamado con los datos correctos
    expect(vendedoresService.crearVendedor).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('VENDEDORES.CREAR_VENDEDOR.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  // Prueba para el método crearVendedor con error
  it('should handle error when creating a vendedor fails', fakeAsync(() => {
    const mockVendedor = {
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      id_type: 'CC',
      identification: '12345678',
      phone: '3001234567',
      username: 'juanperez',
    };

    // Configurar el mock para que devuelva un error
    vendedoresServiceMock.crearVendedor.and.returnValue(
      throwError(() => new Error('Error al crear vendedor')),
    );

    // Establecer valores en el formulario
    component.vendedorForm.setValue(mockVendedor);

    // Llamar al método
    component.crearVendedor();
    tick();

    // Verificar que el servicio fue llamado
    expect(vendedoresService.crearVendedor).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('VENDEDORES.CREAR_VENDEDOR.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();

    // Restablecer el spy para las siguientes pruebas
    vendedoresServiceMock.crearVendedor.and.returnValue(of({}));
  }));
});

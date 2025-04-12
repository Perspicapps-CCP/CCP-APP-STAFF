import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AgregarBodegaComponent } from './agregar-bodega.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BodegasService } from '../../servicios/bodegas.service';

describe('AgregarBodegaComponent', () => {
  let component: AgregarBodegaComponent;
  let fixture: ComponentFixture<AgregarBodegaComponent>;
  let bodegasService: BodegasService;
  let dialogRef: MatDialogRef<AgregarBodegaComponent>;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  // Crear mocks para los servicios
  const bodegasServiceMock = {
    crearBodega: jasmine.createSpy('crearBodega').and.returnValue(of({})),
    obtenerPaises: jasmine.createSpy('obtenerPaises').and.returnValue(of([])),
    obtenerCuidadesPais: jasmine.createSpy('obtenerCuidadesPais').and.returnValue(of([])),
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
        AgregarBodegaComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BodegasService, useValue: bodegasServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarBodegaComponent);
    component = fixture.componentInstance;
    bodegasService = TestBed.inject(BodegasService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    bodegasServiceMock.obtenerPaises.calls.reset();
    bodegasServiceMock.crearBodega.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return required error message for required warehouse_name', () => {
    const form = component.bodegaForm;
    form.get('warehouse_name')?.markAsTouched();

    const errorMessage = component.getErrorMessage('warehouse_name');
    expect(errorMessage.key).toBe('BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_REQUIRED');
  });

  it('should return minlength error message for contact_phone', () => {
    const form = component.bodegaForm;
    form.get('contact_phone')?.setValue('12345');
    form.get('contact_phone')?.markAsTouched();

    const errorMessage = component.getErrorMessage('contact_phone');
    expect(errorMessage.key).toBe('BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  it('should return maxlength error message for contact_phone', () => {
    const form = component.bodegaForm;
    form.get('contact_phone')?.setValue('12345678901234');
    form.get('contact_phone')?.markAsTouched();

    const errorMessage = component.getErrorMessage('contact_phone');
    expect(errorMessage.key).toBe('BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_LENGTH');
    expect(errorMessage.params).toBeDefined();
    expect(errorMessage.params.min).toBe(10);
  });

  it('should return empty error message for valid field', () => {
    const form = component.bodegaForm;
    form.get('warehouse_name')?.setValue('Empresa Test');
    form.get('warehouse_name')?.markAsTouched();

    const errorMessage = component.getErrorMessage('warehouse_name');
    expect(errorMessage.key).toBe('');
  });

  it('should create a new warehouse successfully', fakeAsync(() => {
    const mockWarehouse = {
      warehouse_name: 'Empresa Test',
      address: 'NIT',
      country: '123456789',
      city: 'Calle Test 123',
      contact_phone: '1234567890',
    };

    component.bodegaForm.setValue(mockWarehouse);
    component.crearBodega();
    tick();

    expect(bodegasService.crearBodega).toHaveBeenCalled();
    expect(translateService.get).toHaveBeenCalledWith('BODEGAS.CREAR_BODEGA.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  it('should handle error when creating a manufacturer fails', fakeAsync(() => {
    const mockWarehouse = {
      warehouse_name: 'Empresa Test',
      address: 'NIT',
      country: '123456789',
      city: 'Calle Test 123',
      contact_phone: '1234567890',
    };

    bodegasServiceMock.crearBodega.and.returnValue(
      throwError(() => new Error('Error al crear fabricante')),
    );

    component.bodegaForm.setValue(mockWarehouse);

    component.crearBodega();
    tick();

    expect(bodegasService.crearBodega).toHaveBeenCalled();
    expect(translateService.get).toHaveBeenCalledWith('BODEGAS.CREAR_BODEGA.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
    bodegasServiceMock.crearBodega.and.returnValue(of({}));
  }));

  it('isValidCountry should normalize the country name when matched', () => {
    component.countries = [{ id: 1, name: 'Colombia', iso2: 'CO' }];
    component.bodegaForm.get('country')?.setValue('colombia');

    component.isValidCountry();

    expect(component.bodegaForm.get('country')?.value).toBe('Colombia');
  });

  it('isValidCountry should reset city and country when country not found', () => {
    component.countries = [{ id: 1, name: 'Argentina', iso2: 'AR' }];
    component.bodegaForm.get('country')?.setValue('Colombia');

    component.isValidCountry();

    expect(component.bodegaForm.get('country')?.value).toBe('');
    expect(component.bodegaForm.get('city')?.value).toBe('');
    expect(component.cities).toEqual([]);
  });

  it('should return filtered countries using searchCountries', done => {
    component.countries = [
      { id: 1, name: 'Colombia', iso2: 'CO' },
      { id: 2, name: 'Chile', iso2: 'CL' },
      { id: 3, name: 'Costa Rica', iso2: 'CR' },
    ];

    const searchFn = component.searchCountries(of('co'));
    searchFn.subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('Co');
      done();
    });
  });
});

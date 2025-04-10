import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GenerarRutaComponent } from './generar-ruta.component';
import { BodegasService } from '../../../bodegas/servicios/bodegas.service';
import { RutasService } from '../../servicios/rutas.service';
import { Bodega } from '../../../bodegas/interfaces/bodega.interface';
import { GenerarRutaEntregaPost } from '../../interfaces/generar-ruta-entrega-post';

describe('GenerarRutaComponent', () => {
  let component: GenerarRutaComponent;
  let fixture: ComponentFixture<GenerarRutaComponent>;
  let bodegasService: BodegasService;
  let rutasService: RutasService;
  let dialogRef: MatDialogRef<GenerarRutaComponent>;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  // Mock data con la interfaz correcta de Bodega
  const mockBodegas: Bodega[] = [
    {
      warehouse_id: '1',
      warehouse_name: 'Bodega Test 1',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Dirección Test 1',
      phone: '1234567890',
    },
    {
      warehouse_id: '2',
      warehouse_name: 'Bodega Test 2',
      country: 'Colombia',
      city: 'Medellín',
      address: 'Dirección Test 2',
      phone: '0987654321',
    },
  ];

  // Crear mocks para los servicios
  const bodegasServiceMock = {
    obtenerBodegas: jasmine.createSpy('obtenerBodegas').and.returnValue(of(mockBodegas)),
  };

  const rutasServiceMock = {
    generarRutasEntrega: jasmine.createSpy('generarRutasEntrega').and.returnValue(of({})),
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
      schemas: [NO_ERRORS_SCHEMA], // Permite ignorar elementos no reconocidos en templates
      providers: [
        { provide: BodegasService, useValue: bodegasServiceMock },
        { provide: RutasService, useValue: rutasServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    })
      .overrideComponent(GenerarRutaComponent, {
        set: {
          // Sustituimos el template para evitar problemas con el componente de calendario
          template: `<div>Mocked Template for Testing</div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GenerarRutaComponent);
    component = fixture.componentInstance;
    bodegasService = TestBed.inject(BodegasService);
    rutasService = TestBed.inject(RutasService);
    dialogRef = TestBed.inject(MatDialogRef);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    bodegasServiceMock.obtenerBodegas.calls.reset();
    rutasServiceMock.generarRutasEntrega.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    // Configurar manualmente los datos necesarios
    component.bodegas = mockBodegas;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba que se llamen a los servicios correctamente en ngOnInit
  it('should load warehouses on init', () => {
    component.ngOnInit();
    expect(bodegasService.obtenerBodegas).toHaveBeenCalled();
    expect(component.bodegas).toEqual(mockBodegas);
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with required validators', () => {
    expect(component.generarRutaForm).toBeDefined();
    expect(component.generarRutaForm.get('bodega')?.validator).toBeTruthy();
    expect(component.generarRutaForm.get('fechaRuta')?.validator).toBeTruthy();
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    // Marcar campo como tocado e inválido
    component.generarRutaForm.get('bodega')?.markAsTouched();

    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('bodega')).toBeTruthy();

    // Establecer un valor válido
    component.generarRutaForm.get('bodega')?.setValue(mockBodegas[0]);
    expect(component.isInvalid('bodega')).toBeFalsy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const errorMessage = component.getErrorMessage('bodega');
    expect(errorMessage.key).toBe('RUTAS.CREAR_RUTA.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método formatter del typeahead
  it('should format warehouse names correctly', () => {
    const bodega = { warehouse_name: 'Test Warehouse' };
    expect(component.formatter(bodega)).toBe('Test Warehouse');
  });

  // Prueba para el método crearRuta con éxito
  it('should create a route successfully', fakeAsync(() => {
    // Completar el formulario con la fecha como string (formato YYYY-MM-DD)
    const fechaString = '2025-04-10';
    component.generarRutaForm.setValue({
      bodega: mockBodegas[0],
      fechaRuta: fechaString,
    });

    // Llamar al método
    component.crearRuta();
    tick();

    // Verificar que el servicio fue llamado con los datos correctos
    expect(rutasService.generarRutasEntrega).toHaveBeenCalled();
    const rutaExpected: GenerarRutaEntregaPost = {
      warehouse_id: mockBodegas[0].warehouse_id!,
      date: fechaString,
    };
    expect(rutasService.generarRutasEntrega).toHaveBeenCalledWith(
      jasmine.objectContaining(rutaExpected),
    );

    // Verificar que se muestra el mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('RUTAS.CREAR_RUTA.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  // Prueba para el método crearRuta con error
  it('should handle error when creating a route fails', fakeAsync(() => {
    // Configurar el mock para que devuelva un error
    rutasServiceMock.generarRutasEntrega.and.returnValue(
      throwError(() => new Error('Error al crear ruta')),
    );

    // Completar el formulario con la fecha como string
    const fechaString = '2025-04-10';
    component.generarRutaForm.setValue({
      bodega: mockBodegas[0],
      fechaRuta: fechaString,
    });

    // Llamar al método
    component.crearRuta();
    tick();

    // Verificar que el servicio fue llamado
    expect(rutasService.generarRutasEntrega).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('RUTAS.CREAR_RUTA.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se cierra el diálogo
    expect(dialogRef.close).toHaveBeenCalled();

    // Restablecer el spy para las siguientes pruebas
    rutasServiceMock.generarRutasEntrega.and.returnValue(of({}));
  }));
});

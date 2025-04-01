import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { CrearPlanVentaComponent } from './crear-plan-venta.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { FabricantesService } from '../../../fabricantes/servicios/fabricantes.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

describe('CrearPlanVentaComponent', () => {
  let component: CrearPlanVentaComponent;
  let fixture: ComponentFixture<CrearPlanVentaComponent>;
  let dialogRef: MatDialogRef<CrearPlanVentaComponent>;
  let translateService: TranslateService;
  let vendedoresService: VendedoresService;
  let fabricantesService: FabricantesService;

  // Mock para el MatDialogRef
  const matDialogRefMock = {
    close: jasmine.createSpy('close'),
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

  // Mock para VendedoresService
  const vendedoresServiceMock = {
    obtenerVendedores: jasmine.createSpy('obtenerVendedores').and.returnValue(
      of([
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
      ]),
    ),
  };

  // Mock para FabricantesService
  const fabricantesServiceMock = {
    obtenerProductosFabricante: jasmine.createSpy('obtenerProductosFabricante').and.returnValue(
      of([
        {
          id: '1',
          name: 'Producto Test',
          code: 'PROD001',
          cost: 100,
        },
      ]),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CrearPlanVentaComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        NgbTypeaheadModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: VendedoresService, useValue: vendedoresServiceMock },
        { provide: FabricantesService, useValue: fabricantesServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPlanVentaComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);
    translateService = TestBed.inject(TranslateService);
    vendedoresService = TestBed.inject(VendedoresService);
    fabricantesService = TestBed.inject(FabricantesService);

    // Resetear los spies antes de cada prueba
    matDialogRefMock.close.calls.reset();
    translateServiceMock.get.calls.reset();
    vendedoresServiceMock.obtenerVendedores.calls.reset();
    fabricantesServiceMock.obtenerProductosFabricante.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarBodegaComponent } from './agregar-bodega.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';
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
    bodegasServiceMock.crearBodega.calls.reset();
    matDialogRefMock.close.calls.reset();
    snackBarMock.open.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

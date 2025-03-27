import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { CrearFabricanteComponent } from './crear-fabricante.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CrearFabricanteComponent', () => {
  let component: CrearFabricanteComponent;
  let fixture: ComponentFixture<CrearFabricanteComponent>;

  // Crear mocks para los servicios
  const fabricantesServiceMock = {
    crearFabricante: jasmine.createSpy('crearFabricante').and.returnValue(of({}))
  };

  const matDialogRefMock = {
    close: jasmine.createSpy('close')
  };

  const snackBarMock = {
    open: jasmine.createSpy('open')
  };

  const translateServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of('mensaje traducido')),
    instant: jasmine.createSpy('instant').and.returnValue('mensaje traducido'),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({}),
    getBrowserLang: () => 'es',
    currentLang: 'es'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CrearFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

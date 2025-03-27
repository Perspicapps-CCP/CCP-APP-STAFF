import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AgregarProductoFabricanteComponent } from './agregar-producto-fabricante.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AgregarProductoFabricanteComponent', () => {
  let component: AgregarProductoFabricanteComponent;
  let fixture: ComponentFixture<AgregarProductoFabricanteComponent>;

  // Mock para el MatDialogRef
  const matDialogRefMock = {
    close: jasmine.createSpy('close')
  };

  // Mock para los datos del diálogo (MAT_DIALOG_DATA)
  const dialogDataMock = {
    id: 1,
    manufacturer_name: 'Fabricante Test',
    identification_type: 'NIT',
    identification_number: '123456789',
    address: 'Dirección Test',
    contact_phone: '1234567890',
    email: 'test@example.com'
  };

  // Mock para el TranslateService
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
        AgregarProductoFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock },
        { provide: TranslateService, useValue: translateServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarProductoFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VisorImagenesDialogComponent } from './visor-imagenes-dialog.component';

describe('VisorImagenesDialogComponent', () => {
  let component: VisorImagenesDialogComponent;
  let fixture: ComponentFixture<VisorImagenesDialogComponent>;

  // Mock para el MatDialogRef
  const matDialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  // Mock para los datos del diálogo (MAT_DIALOG_DATA)
  const dialogDataMock = {
    id: 1,
    product_name: 'Producto Test',
    product_code: 'TEST-001',
    price: '100',
    images: ['image1.jpg', 'image2.jpg'],
    manufacturer_id: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VisorImagenesDialogComponent,
        NgbCarouselModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorImagenesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

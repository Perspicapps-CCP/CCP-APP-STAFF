import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RutaDetalleComponent } from './ruta-detalle.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Order, RutaEntrega } from '../../interfaces/rutas-entrega';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

// Mock de la ruta de entrega para usar en las pruebas
const mockRutaEntrega: RutaEntrega = {
  shipping_number: '001',
  licence_plate: 'ABC123',
  driver_name: 'Juan Pérez',
  warehouse: {
    warehouse_id: 'w001',
    warehouse_name: 'Bodega Central',
  },
  delivery_status: 'En ruta',
  orders: [
    {
      order_number_product: 'OP001',
      order_number: 'O001',
      order_address: 'Calle Principal 123',
      customer_phone_number: '1234567890',
      product_id: 'P001',
      product_code: 'PROD001',
      product_name: 'Producto de prueba',
      quantity: 2,
      images: ['img1.jpg', 'img2.jpg'],
    },
  ],
};

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

// Mock del servicio de traducción
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {
    // Simular el cambio de idioma
  }
  use() {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock para MatDialog
class MockMatDialog {
  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: any) => {
        // Simular el cierre del diálogo
      },
    } as MatDialogRef<any>;
  }
}

describe('RutaDetalleComponent', () => {
  let component: RutaDetalleComponent;
  let fixture: ComponentFixture<RutaDetalleComponent>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RutaDetalleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RutaDetalleComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);

    // Proporcionar el input requerido antes de detectChanges
    component.rutaEntrega = { ...mockRutaEntrega };

    // Espiar métodos relevantes
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener correctamente el input de rutaEntrega', () => {
    expect(component.rutaEntrega).toEqual(mockRutaEntrega);
  });

  it('debería abrir el visor de imágenes al llamar abrirVisorImagenes', () => {
    // Crear un pedido de prueba
    const order: Order = {
      order_number_product: 'OP001',
      order_number: 'O001',
      order_address: 'Calle Principal 123',
      customer_phone_number: '1234567890',
      product_id: 'P001',
      product_code: 'PROD001',
      product_name: 'Producto de prueba',
      quantity: 2,
      images: ['img1.jpg', 'img2.jpg'],
    };

    // Llamar al método
    component.abrirVisorImagenes(order);

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(VisorImagenesDialogComponent, {
      data: order,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  });
});

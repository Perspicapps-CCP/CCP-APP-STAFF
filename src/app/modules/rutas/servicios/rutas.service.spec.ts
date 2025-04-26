import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import {
  GenerarRutaEntregaPost,
  GenerarRutaEntregaResponse,
} from '../interfaces/generar-ruta-entrega-post';
import { RutaEntregaMapa } from '../interfaces/ruta-entrega-mapa';
import { RutaEntrega } from '../interfaces/rutas-entrega';
import { RutasService } from './rutas.service';

describe('RutasService', () => {
  let service: RutasService;
  let httpTestingController: HttpTestingController;
  const apiUrl = environment.apiUrlCCP;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RutasService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RutasService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no hay solicitudes pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener rutas de entrega y transformar los datos correctamente', () => {
    // Mock de la respuesta del servidor
    const mockResponse = [
      {
        shipping_number: '001',
        license_plate: 'ABC123',
        diver_name: 'Juan Pérez',
        warehouse: {
          warehouse_id: 'w001',
          warehouse_name: 'Bodega Central',
        },
        warehouse_name: 'Bodega Central',
        delivery_status: 'En ruta',
        orders: [
          {
            order_number: 'O001',
            order_address: 'Calle Principal 123',
            customer_phone_number: '1234567890',
            product_id: 'P001',
            product_code: 'PROD001',
            product_name: 'Producto A',
            quantity: 2,
            images: ['img1.jpg'],
            order_number_product: 'O001-PROD001',
          },
        ],
      },
    ];

    // Resultados esperados después de la transformación
    const expectedResults: RutaEntrega[] = [
      {
        shipping_number: '001',
        license_plate: 'ABC123',
        diver_name: 'Juan Pérez',
        warehouse: {
          warehouse_id: 'w001',
          warehouse_name: 'Bodega Central',
        },
        warehouse_name: 'Bodega Central',
        delivery_status: 'En ruta',
        orders: [
          {
            order_number: 'O001',
            order_address: 'Calle Principal 123',
            customer_phone_number: '1234567890',
            product_id: 'P001',
            product_code: 'PROD001',
            product_name: 'Producto A',
            quantity: 2,
            images: ['img1.jpg'],
            order_number_product: 'O001-PROD001',
          },
        ],
      },
    ];

    // Llamar al método
    let result: RutaEntrega[] = [];
    service.obtenerRutasEntrega().subscribe(data => {
      result = data;
    });

    // Simular la respuesta HTTP
    const req = httpTestingController.expectOne(`${apiUrl}/logistic/delivery`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    // Verificar el resultado transformado
    expect(result).toEqual(expectedResults);
  });

  it('debería obtener coordenadas de ruta para un número de envío', () => {
    const shippingNumber = '001';

    // Mock de la respuesta del servidor
    const mockResponse = [
      {
        shipping_number: '001',
        order_number: 'O001',
        order_address: 'Calle Principal 123',
        customer_phone_number: '1234567890',
        latitude: '4.6097',
        longitude: '-74.0817',
      },
      {
        shipping_number: '001',
        order_number: 'O002',
        order_address: 'Avenida Central 456',
        customer_phone_number: '9876543210',
        latitude: '4.6482',
        longitude: '-74.1059',
      },
    ];

    // Resultados esperados después de la transformación
    const expectedResults: RutaEntregaMapa[] = [
      {
        shipping_number: '001',
        order_number: 'O001',
        order_address: 'Calle Principal 123',
        customer_phone_number: '1234567890',
        latitude: '4.6097',
        longitude: '-74.0817',
      },
      {
        shipping_number: '001',
        order_number: 'O002',
        order_address: 'Avenida Central 456',
        customer_phone_number: '9876543210',
        latitude: '4.6482',
        longitude: '-74.1059',
      },
    ];

    // Llamar al método
    let result: RutaEntregaMapa[] = [];
    service.obtenerRutaMapa(shippingNumber).subscribe(data => {
      result = data;
    });

    // Simular la respuesta HTTP
    const req = httpTestingController.expectOne(`${apiUrl}/logistic/route/${shippingNumber}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    // Verificar el resultado transformado
    expect(result).toEqual(expectedResults);
  });

  it('debería generar rutas de entrega', () => {
    // Datos para la solicitud
    const rutaEntregaPost: GenerarRutaEntregaPost = {
      delivery_date: '2023-04-10',
      warehouse_id: 'w001',
    };

    // Mock de la respuesta del servidor
    const mockResponse: GenerarRutaEntregaResponse = {
      shipping_number: '001',
      licence_plate: 'ABC123',
      warehouse: {
        warehouse_id: 'w001',
        warehouse_name: 'Bodega Central',
      },
      delivery_status: 'Pendiente',
      order: {
        order_number: 'O001',
        order_address: 'Calle Principal 123',
        customer_phone_number: '1234567890',
        product: [],
      },
    };

    // Llamar al método
    let result: GenerarRutaEntregaResponse | undefined;
    service.generarRutasEntrega(rutaEntregaPost).subscribe(data => {
      result = data;
    });

    // Simular la respuesta HTTP
    const req = httpTestingController.expectOne(`${apiUrl}/logistic/delivery/`);
    expect(req.request.method).toEqual('POST');
    // Verificar que el cuerpo de la solicitud es correcto
    expect(req.request.body).toEqual(rutaEntregaPost);
    req.flush(mockResponse);

    // Verificar el resultado
    expect(result).toEqual(mockResponse);
  });

  // Prueba para manejar errores (opcional pero recomendado)
  it('debería manejar errores al obtener rutas de entrega', () => {
    // Espiar el método console.error
    spyOn(console, 'error');

    // Llamar al método que podría fallar
    service.obtenerRutasEntrega().subscribe({
      next: () => fail('debería haber fallado'),
      error: error => {
        // Verificar que se recibe un error
        expect(error.status).toBe(500);
      },
    });

    // Simular una respuesta de error
    const req = httpTestingController.expectOne(`${apiUrl}/logistic/delivery`);
    req.flush('Error interno del servidor', { status: 500, statusText: 'Server Error' });
  });
});

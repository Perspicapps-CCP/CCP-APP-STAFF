import { TestBed } from '@angular/core/testing';

import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { ProductosService } from './productos.service';
import { Vendedor } from '../../vendedores/interfaces/vendedores.interface';
import { Producto } from '../interfaces/productos.interface';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrlCCP;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductosService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificamos que no queden solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener la lista de vendedores', () => {
    // Mock de datos de respuesta
    const mockProductos: Producto[] = [
      {
        product_id: '1',
        product_name: 'Product1',
        product_code: 'p001',
        manufacturer_name: 'Manufacturer',
        price: 12345678,
        images: ['image'],
        quantity: '1',
        warehouse_name: 'WareHouse',
      },
      {
        product_id: '1',
        product_name: 'Product1',
        product_code: 'p001',
        manufacturer_name: 'Manufacturer',
        price: 12345678,
        images: ['image'],
        quantity: '1',
        warehouse_name: 'WareHouse',
      },
    ];

    // Hacemos la llamada al método
    let result: Producto[] | undefined;
    service.obtenerProductos().subscribe(productos => {
      result = productos;
    });

    // Simulamos la respuesta HTTP
    const req = httpMock.expectOne(`${apiUrl}/inventory/stock/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductos);

    // Verificamos el resultado
    expect(result).toEqual(mockProductos);
  });
});

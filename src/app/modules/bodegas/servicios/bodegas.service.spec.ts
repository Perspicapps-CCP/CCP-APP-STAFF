import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BodegasService } from './bodegas.service';
import { environment } from '../../../../environments/environment';
import { Bodega } from '../interfaces/bodega.interface';
import { ProductoBodegaInventario, ProductoBodega } from '../interfaces/producto-bodega';
import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';

describe('BodegasService', () => {
  let service: BodegasService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  // Datos de prueba
  const mockBodegas: Bodega[] = [
    {
      warehouse_id: '1',
      warehouse_name: 'Bodega 1',
      country: 'País 1',
      city: 'Ciudad 1',
      address: 'Dirección 1',
      phone: '123456789',
    },
    {
      warehouse_id: '2',
      warehouse_name: 'Bodega 2',
      country: 'País 2',
      city: 'Ciudad 2',
      address: 'Dirección 2',
      phone: '987654321',
    },
  ];

  const mockProductosInventario: ProductoBodegaInventario[] = [
    { product_id: '101', warehouse_id: '1', quantity: 10, last_update: new Date() },
    { product_id: '102', warehouse_id: '1', quantity: 20, last_update: new Date() },
  ];

  const mockProductosFabricante: ProductoFabricante[] = [
    {
      id: '101',
      name: 'Producto 1',
      product_code: 'P001',
      price: 100,
      images: ['imagen1.jpg'],
    },
    {
      id: '102',
      name: 'Producto 2',
      product_code: 'P002',
      price: 200,
      images: ['imagen2.jpg'],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BodegasService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BodegasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerBodegas', () => {
    it('debe retornar un array de bodegas', () => {
      const mockResponse = {
        data: {
          warehouses: mockBodegas,
        },
      };

      service.obtenerBodegas().subscribe(bodegas => {
        expect(bodegas).toEqual(mockBodegas);
        expect(bodegas.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/inventory/warehouse`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('obtenerProductosBodega', () => {
    it('debe obtener productos de una bodega y combinarlos con información del fabricante', () => {
      const bodega: Bodega = mockBodegas[0];

      const mockInventarioResponse = {
        data: {
          productos: mockProductosInventario,
        },
      };

      const mockFabricanteResponse = {
        data: {
          productos: mockProductosFabricante,
        },
      };

      // Resultados esperados después de la combinación
      const expectedProductos: ProductoBodega[] = [
        {
          ...mockProductosFabricante[0],
          quantity: '10',
        },
        {
          ...mockProductosFabricante[1],
          quantity: '20',
        },
      ];

      service.obtenerProductosBodega(bodega).subscribe(productos => {
        expect(productos.length).toBe(2);
        expect(productos[0].id).toBe('101');
        expect(productos[0].name).toBe('Producto 1');
        expect(productos[0].product_code).toBe('P001');
        expect(productos[0].price).toBe(100);
        expect(productos[0].quantity).toBe('10');
        expect(productos[1].id).toBe('102');
        expect(productos[1].quantity).toBe('20');
      });

      // Primera solicitud para obtener productos de inventario
      const reqInventario = httpMock.expectOne(
        `${apiUrl}/inventory?warehouse=${bodega.warehouse_id}`,
      );
      expect(reqInventario.request.method).toBe('GET');
      reqInventario.flush(mockInventarioResponse);

      // Segunda solicitud para obtener detalles de los productos del fabricante
      const reqFabricante = httpMock.expectOne(`${apiUrl}/manufacturers/listProducts`);
      expect(reqFabricante.request.method).toBe('POST');
      expect(reqFabricante.request.body).toEqual({
        idsProductos: ['101', '102'],
      });
      reqFabricante.flush(mockFabricanteResponse);
    });
  });

  describe('unionProductosBodega', () => {
    it('debe combinar correctamente los productos de inventario y fabricante', () => {
      const resultado = service.unionProductosBodega(
        mockProductosInventario,
        mockProductosFabricante,
      );

      expect(resultado.length).toBe(2);
      expect(resultado[0].id).toBe('101');
      expect(resultado[0].name).toBe('Producto 1');
      expect(resultado[0].product_code).toBe('P001');
      expect(resultado[0].price).toBe(100);
      expect(resultado[0].quantity).toBe('10');
      expect(resultado[1].id).toBe('102');
      expect(resultado[1].name).toBe('Producto 2');
      expect(resultado[1].quantity).toBe('20');
    });

    it('debe ignorar productos que no existen en la lista de fabricantes', () => {
      const productosInventarioExtra: ProductoBodegaInventario[] = [
        ...mockProductosInventario,
        {
          product_id: '103',
          warehouse_id: '1',
          quantity: 30,
          last_update: new Date(),
        }, // Este producto no existe en mockProductosFabricante
      ];

      const resultado = service.unionProductosBodega(
        productosInventarioExtra,
        mockProductosFabricante,
      );

      expect(resultado.length).toBe(2); // Solo 2 productos deberían ser combinados
      expect(resultado.some(p => p.id === '103')).toBeFalsy(); // El producto 103 no debería estar en el resultado
    });

    it('debe manejar un array vacío de productos', () => {
      const resultado = service.unionProductosBodega([], mockProductosFabricante);
      expect(resultado.length).toBe(0);
    });
  });
});

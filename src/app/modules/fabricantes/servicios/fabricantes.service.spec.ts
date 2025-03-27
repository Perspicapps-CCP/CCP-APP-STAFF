import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FabricantesService } from './fabricantes.service';
import { environment } from '../../../../environments/environment';
import { Fabricante } from '../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../interfaces/producto-fabricante.interface';

describe('FabricantesService', () => {
  let service: FabricantesService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FabricantesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FabricantesService);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no haya peticiones pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener la lista de fabricantes', () => {
    // Mock de la respuesta del servidor
    const mockResponse = {
      data: {
        fabricantes: [
          { id: '1', manufacturer_name: 'Fabricante 1' },
          { id: '2', manufacturer_name: 'Fabricante 2' }
        ]
      }
    };

    // Llamar al método del servicio
    let resultado: Fabricante[] = [];
    service.obtenerFabricantes().subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrl}/manufacturers`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    console.log('Mock Response:', resultado);
    expect(resultado.length).toBe(2);
    expect(resultado[0].id).toBe('1');
    expect(resultado[0].manufacturer_name).toBe('Fabricante 1');
    expect(resultado[1].id).toBe('2');
    expect(resultado[1].manufacturer_name).toBe('Fabricante 2');
  });

  it('debería obtener los productos de un fabricante y formatear el costo', () => {
    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '1',
      manufacturer_name: 'Test Fabricante',
      identification_number: '123456',
      contact_phone: '555-1234',
      address: 'Calle Test 123',
      email: 'test@fabricante.com',
      expandido: false
    };
    // Mock de la respuesta del servidor
    const mockResponse = {
      data: {
        productos: [
          { id: '101', name: 'Producto 1', product_code: 'abc123', unit_cost: 10.5 ,images: [] },
          { id: '102', name: 'Producto 2', product_code: 'abc123', unit_cost: 20.75 ,images: [] },
        ]
      }
    };

    // Llamar al método del servicio
    let resultado: ProductoFabricante[] = [];
    service.obtenerProductosFabricante(fabricante).subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrl}/manufacturers/products/${fabricante.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // Verificar resultados
    expect(resultado.length).toBe(2);
    expect(resultado[0].id).toBe('101');
    expect(resultado[0].name).toBe('Producto 1');
    expect(resultado[0].unit_cost).toBe(10.5);
    expect(resultado[1].id).toBe('102');
    expect(resultado[1].name).toBe('Producto 2');
    expect(resultado[1].unit_cost).toBe(20.75);
  });

  it('debería crear un fabricante correctamente', (done) => {
    // Crear fabricante de prueba para enviar
    const nuevoFabricante: Fabricante = {
      manufacturer_name: "Percy Aufderhar",
      identification_type: "CE",
      identification_number: "27d90e27-970a-41e7-83c1-7e6402296a51",
      address: "7631 Lucio Lakes",
      contact_phone: "289.999.4000",
      email: "Faye20@hotmail.com",
    };

    // Mock de la respuesta del servidor (fabricante creado con ID asignado)
    const mockResponse = {
      data: {
        fabricante: {
          manufacturer_name: "Percy Aufderhar",
          identification_type: "CE",
          identification_number: "27d90e27-970a-41e7-83c1-7e6402296a51",
          address: "7631 Lucio Lakes",
          contact_phone: "289.999.4000",
          email: "Faye20@hotmail.com",
          id: "423b3d2c-bc23-4892-8022-0ee081803d19",
        }
      }
    };

    // Llamar al método del servicio
    service.crearFabricante(nuevoFabricante).subscribe({
      next: (fabricanteCreado) => {
        // Verificaciones dentro del subscribe para asegurar que se ejecuten después de recibir la respuesta
        expect(fabricanteCreado).toBeTruthy();
        expect(fabricanteCreado.id).toBe('423b3d2c-bc23-4892-8022-0ee081803d19');
        expect(fabricanteCreado.manufacturer_name).toBe('Percy Aufderhar');
        expect(fabricanteCreado.identification_number).toBe('27d90e27-970a-41e7-83c1-7e6402296a51');
        expect(fabricanteCreado.contact_phone).toBe('289.999.4000');
        expect(fabricanteCreado.address).toBe('7631 Lucio Lakes');
        expect(fabricanteCreado.email).toBe('Faye20@hotmail.com');
        done(); // Indicar que la prueba asíncrona está completa
      },
      error: (error) => {
        done.fail(error); // Fallar el test si hay un error
      }
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrl}/fabricantes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoFabricante);
    req.flush(mockResponse);
  });
});

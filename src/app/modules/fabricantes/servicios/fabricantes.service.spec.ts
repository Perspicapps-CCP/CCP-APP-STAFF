import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FabricantesService } from './fabricantes.service';
import { environment } from '../../../../environments/environment';
import { Fabricante } from '../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../interfaces/producto-fabricante.interface';
import { MasivoProductoResponse } from '../interfaces/masivo-productos-response';

describe('FabricantesService', () => {
  let service: FabricantesService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FabricantesService, provideHttpClient(), provideHttpClientTesting()],
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
    const mockResponse = [
      { id: '1', manufacturer_name: 'Fabricante 1' },
      { id: '2', manufacturer_name: 'Fabricante 2' },
    ];

    // Llamar al método del servicio
    let resultado: Fabricante[] = [];
    service.obtenerFabricantes().subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/suppliers/manufacturers/`);
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
      expandido: false,
    };
    // Mock de la respuesta del servidor
    const mockResponse = [
      { id: '101', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: [] },
      { id: '102', name: 'Producto 2', product_code: 'abc123', price: 20.75, images: [] },
    ];

    // Llamar al método del servicio
    let resultado: ProductoFabricante[] = [];
    service.obtenerProductosFabricante(fabricante).subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/suppliers/manufacturers/${fabricante.id}/products/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // Verificar resultados
    expect(resultado.length).toBe(2);
    expect(resultado[0].id).toBe('101');
    expect(resultado[0].name).toBe('Producto 1');
    expect(resultado[0].price).toBe(10.5);
    expect(resultado[1].id).toBe('102');
    expect(resultado[1].name).toBe('Producto 2');
    expect(resultado[1].price).toBe(20.75);
  });

  it('debería crear un fabricante correctamente', done => {
    // Crear fabricante de prueba para enviar
    const nuevoFabricante: Fabricante = {
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '289.999.4000',
      email: 'Faye20@hotmail.com',
    };

    // Mock de la respuesta del servidor (fabricante creado con ID asignado)
    const mockResponse = {
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '289.999.4000',
      email: 'Faye20@hotmail.com',
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
    };

    // Llamar al método del servicio
    service.crearFabricante(nuevoFabricante).subscribe({
      next: fabricanteCreado => {
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
      error: error => {
        done.fail(error); // Fallar el test si hay un error
      },
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrlCCP}/suppliers/manufacturers/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoFabricante);
    req.flush(mockResponse);
  });

  it('debería obtener productos por IDs', () => {
    // Array de IDs a enviar
    const idsProductos = ['101', '102', '103'];

    // Mock de la respuesta del servidor
    const mockResponse = [
      { id: '101', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: [] },
      { id: '102', name: 'Producto 2', product_code: 'def456', price: 20.75, images: [] },
      { id: '103', name: 'Producto 3', product_code: 'ghi789', price: 15.25, images: [] },
    ];

    // Llamar al método del servicio
    let resultado: ProductoFabricante[] = [];
    service.obtenerProductos(idsProductos).subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/suppliers/manufacturers/listProducts/`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productsIds: idsProductos });
    req.flush(mockResponse);

    // Verificar resultados
    expect(resultado.length).toBe(3);
    expect(resultado[0].id).toBe('101');
    expect(resultado[0].name).toBe('Producto 1');
    expect(resultado[0].price).toBe(10.5);
    expect(resultado[1].id).toBe('102');
    expect(resultado[1].name).toBe('Producto 2');
    expect(resultado[2].id).toBe('103');
    expect(resultado[2].name).toBe('Producto 3');
  });

  it('debería obtener productos sin enviar IDs (array vacío)', () => {
    // Mock de la respuesta del servidor cuando no se envían IDs
    const mockResponse: ProductoFabricante[] = [
      { id: '101', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: [] },
      { id: '102', name: 'Producto 2', product_code: 'def456', price: 20.75, images: [] },
      { id: '103', name: 'Producto 3', product_code: 'ghi789', price: 15.25, images: [] },
    ];

    // Llamar al método del servicio sin pasar IDs (usará el valor por defecto [])
    let resultado: ProductoFabricante[] = [];
    service.obtenerProductos().subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/suppliers/manufacturers/listProducts/`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productsIds: [] }); // Verificar que se envía un array vacío
    req.flush(mockResponse);

    // Verificar que el resultado es un array vacío
    expect(resultado).toEqual([
      { id: '101', name: 'Producto 1', product_code: 'abc123', price: 10.5, images: [] },
      { id: '102', name: 'Producto 2', product_code: 'def456', price: 20.75, images: [] },
      { id: '103', name: 'Producto 3', product_code: 'ghi789', price: 15.25, images: [] },
    ]);
    expect(resultado.length).toBe(3);
  });

  // Nueva prueba para cargaMasivaProductosFabricante
  it('debería realizar la carga masiva de productos para un fabricante', done => {
    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Crear un archivo CSV mock
    const file = new File(['contenido del csv'], 'productos.csv', { type: 'text/csv' });

    // Mock de la respuesta del servidor
    const mockResponse: MasivoProductoResponse = {
      total_successful_records: 8,
      total_errors_records: 2,
      detail: [
        { row_file: 3, detail: 'Campo requerido faltante' },
        { row_file: 5, detail: 'Formato inválido' },
      ],
    };

    // Llamar al método del servicio
    service.cargaMasivaProductosFabricante(fabricante, file).subscribe({
      next: response => {
        // Verificar la respuesta
        expect(response).toBeTruthy();
        expect(response.total_successful_records).toBe(8);
        expect(response.total_errors_records).toBe(2);
        expect(response.detail.length).toBe(2);
        expect(response.detail[0].row_file).toBe(3);
        expect(response.detail[0].detail).toBe('Campo requerido faltante');
        expect(response.detail[1].row_file).toBe(5);
        expect(response.detail[1].detail).toBe('Formato inválido');
        done();
      },
      error: error => {
        done.fail(error);
      },
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/suppliers/manufacturers/${fabricante.id}/products/batch/`,
    );
    expect(req.request.method).toBe('POST');

    // Verificar que el cuerpo es un FormData que contiene un archivo
    // Nota: No podemos verificar directamente el contenido del FormData,
    // pero podemos comprobar que es una instancia de FormData
    expect(req.request.body instanceof FormData).toBeTruthy();

    req.flush(mockResponse);
  });

  // Prueba adicional para cargaMasivaProductosFabricante con respuesta exitosa (sin errores)
  it('debería procesar correctamente una carga masiva sin errores', done => {
    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '423b3d2c-bc23-4892-8022-0ee081803d19',
      manufacturer_name: 'Percy Aufderhar',
      identification_type: 'CE',
      identification_number: '27d90e27-970a-41e7-83c1-7e6402296a51',
      address: '7631 Lucio Lakes',
      contact_phone: '2899994000',
      email: 'Faye20@hotmail.com',
    };

    // Crear un archivo CSV mock
    const file = new File(['contenido del csv'], 'productos.csv', { type: 'text/csv' });

    // Mock de la respuesta del servidor (sin errores)
    const mockResponse: MasivoProductoResponse = {
      total_successful_records: 10,
      total_errors_records: 0,
      detail: [],
    };

    // Espiar el objeto FormData
    spyOn(window as any, 'FormData').and.returnValue({
      append: jasmine.createSpy('append'),
    });

    // Llamar al método del servicio
    service.cargaMasivaProductosFabricante(fabricante, file).subscribe({
      next: response => {
        // Verificar la respuesta
        expect(response).toBeTruthy();
        expect(response.total_successful_records).toBe(10);
        expect(response.total_errors_records).toBe(0);
        expect(response.detail.length).toBe(0);
        done();
      },
      error: error => {
        done.fail(error);
      },
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/suppliers/manufacturers/${fabricante.id}/products/batch/`,
    );
    expect(req.request.method).toBe('POST');

    // Verificar que se está usando FormData
    expect(window.FormData).toHaveBeenCalled();

    // Verificar que se agregó el archivo al FormData
    const formData = (window as any).FormData();
    expect(formData.append).toHaveBeenCalledWith('file', file);

    req.flush(mockResponse);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VendedoresService } from './vendedores.service';
import { Vendedor } from '../interfaces/vendedores.interface';
import { environment } from '../../../../environments/environment';

describe('VendedoresService', () => {
  let service: VendedoresService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendedoresService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(VendedoresService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificamos que no queden solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerVendedores', () => {
    it('debería obtener la lista de vendedores', () => {
      // Mock de datos de respuesta
      const mockVendedores: Vendedor[] = [
        {
          id: '1',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'DNI',
          identification: '12345678',
          phone: '123456789',
          username: 'juanperez',
        },
        {
          id: '2',
          full_name: 'María López',
          email: 'maria@example.com',
          id_type: 'DNI',
          identification: '87654321',
          phone: '987654321',
          username: 'marialopez',
        },
      ];

      const mockResponse = {
        data: {
          vendedores: mockVendedores,
        },
      };

      // Hacemos la llamada al método
      let result: Vendedor[] | undefined;
      service.obtenerVendedores().subscribe(vendedores => {
        result = vendedores;
      });

      // Simulamos la respuesta HTTP
      const req = httpMock.expectOne(`${apiUrl}/sales/sellers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      // Verificamos el resultado
      expect(result).toEqual(mockVendedores);
    });

    it('debería manejar un error al obtener vendedores', () => {
      // Hacemos la llamada al método
      let errorResponse: any;
      service.obtenerVendedores().subscribe({
        next: () => fail('Se esperaba un error pero se recibió una respuesta exitosa'),
        error: error => {
          errorResponse = error;
        },
      });

      // Simulamos un error HTTP
      const req = httpMock.expectOne(`${apiUrl}/sales/sellers`);
      const mockError = new ProgressEvent('error', {
        lengthComputable: false,
        loaded: 0,
        total: 0,
      });
      req.error(mockError, {
        status: 500,
        statusText: 'Error al cargar vendedores',
      });

      // Verificamos que el error se haya capturado
      expect(errorResponse).toBeTruthy();
    });
  });

  describe('crearVendedor', () => {
    it('debería crear un nuevo vendedor', () => {
      // Mock de datos de entrada y respuesta
      const nuevoVendedor: Vendedor = {
        full_name: 'Carlos Gómez',
        email: 'carlos@example.com',
        id_type: 'DNI',
        identification: '11223344',
        phone: '555666777',
        username: 'carlosgomez',
      };

      const vendedorCreado: Vendedor = {
        ...nuevoVendedor,
        id: '3',
      };

      const mockResponse = {
        data: {
          vendedor: vendedorCreado,
        },
      };

      // Hacemos la llamada al método
      let result: Vendedor | undefined;
      service.crearVendedor(nuevoVendedor).subscribe(vendedor => {
        result = vendedor;
      });

      // Simulamos la respuesta HTTP
      const req = httpMock.expectOne(`${apiUrl}/sales/sellers`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoVendedor);
      req.flush(mockResponse);

      // Verificamos el resultado
      expect(result).toEqual(vendedorCreado);
    });

    it('debería manejar un error al crear un vendedor', () => {
      // Mock de datos de entrada
      const nuevoVendedor: Vendedor = {
        full_name: 'Carlos Gómez',
        email: 'carlos@example.com',
        id_type: 'DNI',
        identification: '11223344',
        phone: '555666777',
        username: 'carlosgomez',
      };

      // Hacemos la llamada al método
      let errorResponse: any;
      service.crearVendedor(nuevoVendedor).subscribe({
        next: () => fail('Se esperaba un error pero se recibió una respuesta exitosa'),
        error: error => {
          errorResponse = error;
        },
      });

      // Simulamos un error HTTP
      const req = httpMock.expectOne(`${apiUrl}/sales/sellers`);
      expect(req.request.method).toBe('POST');
      const mockError = new ProgressEvent('error', {
        lengthComputable: false,
        loaded: 0,
        total: 0,
      });
      req.error(mockError, {
        status: 500,
        statusText: 'Error al crear vendedor',
      });

      // Verificamos que el error se haya capturado
      expect(errorResponse).toBeTruthy();
    });
  });
});

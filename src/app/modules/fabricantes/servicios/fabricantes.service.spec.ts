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
          { id: '1', nombre: 'Fabricante 1' },
          { id: '2', nombre: 'Fabricante 2' }
        ]
      }
    };

    // Llamar al método del servicio
    let resultado: Fabricante[] = [];
    service.obtenerFabricantes().subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrl}/fabricantes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    console.log('Mock Response:', resultado);
    expect(resultado.length).toBe(2);
    expect(resultado[0].id).toBe('1');
    expect(resultado[0].nombre).toBe('Fabricante 1');
    expect(resultado[1].id).toBe('2');
    expect(resultado[1].nombre).toBe('Fabricante 2');
  });

  it('debería obtener los productos de un fabricante y formatear el costo', () => {
    // Crear un fabricante de prueba
    const fabricante: Fabricante = {
      id: '1',
      nombre: 'Test Fabricante',
      identificacion: '123456',
      telefono: '555-1234',
      direccion: 'Calle Test 123',
      correo: 'test@fabricante.com',
      productos: [],
      expandido: false
    };

    // Mock de la respuesta del servidor
    const mockResponse = {
      data: {
        productos: [
          { id: '101', nombre: 'Producto 1', costoUnidad: 10.5 },
          { id: '102', nombre: 'Producto 2', costoUnidad: 20.75 }
        ]
      }
    };

    // Llamar al método del servicio
    let resultado: ProductoFabricante[] = [];
    service.obtenerProductosFabricante(fabricante).subscribe(data => {
      resultado = data;
    });

    // Configurar la respuesta mock para la petición HTTP
    const req = httpMock.expectOne(`${environment.apiUrl}/productos-fabricante/${fabricante.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    // Verificar resultados
    expect(resultado.length).toBe(2);
    expect(resultado[0].id).toBe('101');
    expect(resultado[0].nombre).toBe('Producto 1');
    expect(resultado[0].costoUnidad).toBe(10.5);
    expect(resultado[1].id).toBe('102');
    expect(resultado[1].nombre).toBe('Producto 2');
    expect(resultado[1].costoUnidad).toBe(20.75);
  });

  it('debería crear un fabricante correctamente', (done) => {
    // Crear fabricante de prueba para enviar
    const nuevoFabricante: Fabricante = {
      id: '3',
      nombre: 'Nuevo Fabricante',
      identificacion: '123456',
      telefono: '555-1234',
      direccion: 'Calle Test 123',
      correo: 'test@fabricante.com',
      productos: [],
      expandido: false
    };

    // Mock de la respuesta del servidor (fabricante creado con ID asignado)
    const mockResponse = {
      data: {
        fabricante: {
          id: '3',
          nombre: 'Nuevo Fabricante',
          identificacion: '123456',
          telefono: '555-1234',
          direccion: 'Calle Test 123',
          correo: 'test@fabricante.com',
          productos: [],
          expandido: false
        }
      }
    };

    // Llamar al método del servicio
    service.crearFabricante(nuevoFabricante).subscribe({
      next: (fabricanteCreado) => {
        // Verificaciones dentro del subscribe para asegurar que se ejecuten después de recibir la respuesta
        expect(fabricanteCreado).toBeTruthy();
        expect(fabricanteCreado.id).toBe('3');
        expect(fabricanteCreado.nombre).toBe('Nuevo Fabricante');
        expect(fabricanteCreado.identificacion).toBe('123456');
        expect(fabricanteCreado.telefono).toBe('555-1234');
        expect(fabricanteCreado.direccion).toBe('Calle Test 123');
        expect(fabricanteCreado.correo).toBe('test@fabricante.com');
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

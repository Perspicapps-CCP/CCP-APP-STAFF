import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FabricantesService } from './fabricantes.service';
import { environment } from '../../../../environments/environment';
import { Fabricante } from '../interfaces/fabricantes.interface';

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
});

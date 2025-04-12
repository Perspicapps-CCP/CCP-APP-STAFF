import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from '../../../shared/servicios/localization.service';
import { VentasService } from './ventas.service';
import { VentaQuery, VentaTabla } from '../interfaces/ventas.interface';

describe('VentasService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;
  let service: VentasService;

  beforeEach(() => {
    // Mock simple para LocalDatePipe
    localDatePipeMock = {
      transform: jasmine.createSpy('transform').and.callFake(date => new Date(date)),
    };

    // Spy para HttpClient
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    // Spy para LocalizationService con propiedades observables
    localizationServiceSpy = jasmine.createSpyObj('LocalizationService', ['getCurrentLanguage'], {
      currentLocalization$: new BehaviorSubject({
        langCode: 'es',
        localeCode: 'es-CO',
      }).asObservable(),
      currentLocale$: of('es-CO'),
      currentLang$: of('es'),
    });
    localizationServiceSpy.getCurrentLanguage.and.returnValue('es');

    // Creamos el servicio directamente y reemplazamos la propiedad LocalDatePipe
    service = new VentasService(httpClientSpy, localizationServiceSpy);

    // Sobreescribimos la propiedad privada para evitar la instanciación de LocalDatePipe
    Object.defineProperty(service, 'localDatePipe', {
      value: localDatePipeMock,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve ventas from the API and transform the response', () => {
    // Mock de la query para filtrar ventas
    const mockQuery: VentaQuery = {
      seller_id: '123',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
    };

    // Mock de la respuesta de la API (datos crudos)
    const apiResponse = [
      {
        id: '1',
        order_number: 12345,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-15T10:30:00.000Z',
        total_value: '150000',
      },
      {
        id: '2',
        order_number: 12346,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-20T14:45:00.000Z',
        total_value: '250000',
      },
    ];

    // Datos transformados esperados después del mapeo - Con total_value como número
    const expectedVentas: VentaTabla[] = [
      {
        id: '1',
        order_number: '12345',
        seller_name: 'Juan Pérez',
        created_at: new Date('2025-01-15T10:30:00.000Z'),
        total_value: '150000', // Número en lugar de string
      },
      {
        id: '2',
        order_number: '12346',
        seller_name: 'Juan Pérez',
        created_at: new Date('2025-01-20T14:45:00.000Z'),
        total_value: '250000', // Número en lugar de string
      },
    ];

    // Configuramos el espía para devolver la respuesta mock
    httpClientSpy.get.and.returnValue(of(apiResponse));

    // Llamamos al método del servicio
    service.obtenerVentas(mockQuery).subscribe(ventas => {
      // Verificamos que los datos transformados sean correctos
      expect(ventas).toEqual(expectedVentas);

      // Verificamos que la transformación de fechas se haya llamado correctamente
      expect(localDatePipeMock.transform).toHaveBeenCalledWith(
        '2025-01-15T10:30:00.000Z',
        undefined,
        true,
      );
      expect(localDatePipeMock.transform).toHaveBeenCalledWith(
        '2025-01-20T14:45:00.000Z',
        undefined,
        true,
      );
    });

    // Verificamos que se haya llamado al endpoint correcto con los parámetros adecuados
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/sales/sales/?seller_id=123&start_date=2025-01-01&end_date=2025-01-31`,
    );
  });

  it('should calculate total ventas correctly', () => {
    // Mock de la query para filtrar ventas
    const mockQuery: VentaQuery = {
      seller_id: '123',
    };

    // Mock de la respuesta de la API con valores para sumar
    const apiResponse = [
      {
        id: '1',
        order_number: 12345,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-15T10:30:00.000Z',
        total_value: 150000,
      },
      {
        id: '2',
        order_number: 12346,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-20T14:45:00.000Z',
        total_value: 250000,
      },
    ];

    // Configuramos el espía para devolver la respuesta mock
    httpClientSpy.get.and.returnValue(of(apiResponse));

    // Llamamos al método del servicio
    service.obtenerVentas(mockQuery).subscribe(() => {
      // Verificamos que el total se haya calculado correctamente
      expect(service.getTotalVentas()).toBe(400000); // 150000 + 250000
    });

    // Verificamos que se haya llamado al endpoint correcto
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/sales/sales/?seller_id=123`,
    );
  });

  it('should handle empty or null values in total calculation', () => {
    const mockQuery: VentaQuery = {};

    // Respuesta con valores vacíos o nulos
    const apiResponse = [
      {
        id: '1',
        order_number: 12345,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-15T10:30:00.000Z',
        total_value: null, // Valor nulo
      },
      {
        id: '2',
        order_number: 12346,
        seller: {
          id: '123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          id_type: 'CC',
          identification: '123456789',
          phone: '3001234567',
          username: 'juanp',
          role: 'vendedor',
        },
        created_at: '2025-01-20T14:45:00.000Z',
        total_value: 100000, // Valor numérico
      },
    ];

    httpClientSpy.get.and.returnValue(of(apiResponse));

    service.obtenerVentas(mockQuery).subscribe(() => {
      // Debería manejar correctamente los valores nulos/vacíos
      expect(service.getTotalVentas()).toBe(100000);
    });
  });

  it('should generate download URL correctly', () => {
    const mockQuery: VentaQuery = {
      seller_id: '123',
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      seller_name: 'Juan',
      order_number: 12345,
    };

    const expectedUrl = `${environment.apiUrlCCP}/api/v1/sales/sales/export/?seller_id=123&start_date=2025-01-01&end_date=2025-01-31&seller_name=Juan&order_number=12345`;

    // Llamamos al método obtenerUrlDescarga
    const resultUrl = service.obtenerUrlDescarga(mockQuery);

    // Verificamos que la URL generada sea correcta
    expect(resultUrl).toBe(expectedUrl);
  });

  it('should handle query parameters with special characters in download URL', () => {
    const mockQuery: VentaQuery = {
      seller_name: 'Juan & María',
      start_date: '2025/01/01',
    };

    const expectedUrl = `${environment.apiUrlCCP}/api/v1/sales/sales/export/?seller_name=Juan%20%26%20Mar%C3%ADa&start_date=2025%2F01%2F01`;

    // Llamamos al método obtenerUrlDescarga
    const resultUrl = service.obtenerUrlDescarga(mockQuery);

    // Verificamos que la URL generada codifique correctamente los caracteres especiales
    expect(resultUrl).toBe(expectedUrl);
  });

  it('should filter out undefined and null values from query parameters', () => {
    const mockQuery: VentaQuery = {
      seller_id: '123',
      start_date: undefined,
      order_number: 12345,
    };

    // La URL esperada no debe incluir los parámetros undefined o null
    const expectedUrl = `${environment.apiUrlCCP}/api/v1/sales/sales/export/?seller_id=123&order_number=12345`;

    const resultUrl = service.obtenerUrlDescarga(mockQuery);

    expect(resultUrl).toBe(expectedUrl);
  });
});

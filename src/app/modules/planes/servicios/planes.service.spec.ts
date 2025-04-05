import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocalizationService } from '../../../shared/servicios/localization.service';
import { PlanVenta, PlanVentaPost } from '../interfaces/planes.interface';
import { PlanesService } from './planes.service';

describe('PlanesService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;
  let service: PlanesService;

  beforeEach(() => {
    // Mock simple para LocalDatePipe
    localDatePipeMock = {
      transform: jasmine.createSpy('transform').and.callFake(date => new Date(date)),
    };

    // Spy para HttpClient
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']); // Add 'post' here

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

    // En lugar de usar TestBed para inyectar dependencias,
    // creamos el servicio directamente y reemplazamos la propiedad LocalDatePipe
    service = new PlanesService(httpClientSpy, localizationServiceSpy);
    // Sobreescribimos la propiedad privada para evitar la instanciación de LocalDatePipe
    Object.defineProperty(service, 'localDatePipe', {
      value: localDatePipeMock,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve planes from the API', () => {
    const mockPlanes: PlanVenta[] = [
      {
        id: '1',
        product_id: 'prod-1',
        start_date: new Date('2025-01-01T00:00:00.000Z'),
        end_date: new Date('2025-12-31T00:00:00.000Z'),
        goal: '1000',
        sellers: [],
        product: {
          id: 'prod-001',
          name: 'Producto 1',
          product_code: 'P001',
          price: 1000,
          images: [],
        },
      },
    ];

    // Mock the API response with string dates that will be transformed
    const apiResponse = [
      {
        id: '1',
        product_id: 'prod-1',
        start_date: '2025-01-01T00:00:00.000Z',
        end_date: '2025-12-31T00:00:00.000Z',
        goal: 1000,
        sellers: [],
        product: {
          id: 'prod-001',
          name: 'Producto 1',
          product_code: 'P001',
          price: 1000,
          images: [],
        },
      },
    ];

    httpClientSpy.get.and.returnValue(of(apiResponse));

    service.obtenerPlanes().subscribe(planes => {
      expect(planes).toEqual(mockPlanes);
      expect(planes[0].goal).toBe('1000');

      expect(localDatePipeMock.transform).toHaveBeenCalledWith(
        '2025-01-01T00:00:00.000Z',
        undefined,
        true,
      );
      expect(localDatePipeMock.transform).toHaveBeenCalledWith(
        '2025-12-31T00:00:00.000Z',
        undefined,
        true,
      );
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrlCCP}/api/v1/sales/plans/`);
  });

  it('should call crearPlan from the API', () => {
    const mockPlan: PlanVentaPost = {
      product_id: 'prod-1',
      start_date: new Date('2025-01-01T00:00:00.000Z'),
      end_date: new Date('2025-12-31T00:00:00.000Z'),
      goal: 1000,
      seller_ids: [],
    };

    httpClientSpy.post.and.returnValue(of(mockPlan));

    service.crearPlan(mockPlan).subscribe(plan => {
      expect(plan).toEqual(mockPlan);
    });

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/sales/plans/`,
      mockPlan,
    );
  });
});

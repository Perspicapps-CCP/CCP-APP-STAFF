import { TestBed } from '@angular/core/testing';

import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { ProductosService } from './productos.service';

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
});

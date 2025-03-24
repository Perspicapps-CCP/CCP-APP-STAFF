import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { httpHeadersInterceptor } from './http-headers.interceptor';
import { of } from 'rxjs';

describe('httpHeadersInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => httpHeadersInterceptor(req, next));

  let nextHandlerSpy: jasmine.Spy;
  let next: HttpHandlerFn;

  // Crear un mock de localStorage
  const mockLocalStorage = {
    getItem: jasmine.createSpy('getItem').and.returnValue('fake-token')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // Reiniciar los contadores de llamadas
    mockLocalStorage.getItem.calls.reset();

    // Reemplazar localStorage.getItem con nuestro método espiado
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return mockLocalStorage.getItem(key);
    });

    // Crear espía para el next handler
    nextHandlerSpy = jasmine.createSpy('next').and.returnValue(of({}));
    next = nextHandlerSpy;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header for non-login urls', () => {
    // Crear un request para una URL no-login
    const request = new HttpRequest<unknown>('GET', 'https://api.example.com/users');

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que localStorage.getItem fue llamado con 'token'
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');

    // Verificar que next fue llamado con un request que incluye el header de autorización
    const modifiedRequest = nextHandlerSpy.calls.first().args[0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should not add Authorization header for login urls', () => {
    // Crear un request para una URL de login
    const request = new HttpRequest<unknown>('POST', 'https://api.example.com/login', null);

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que localStorage.getItem no fue llamado
    expect(mockLocalStorage.getItem).not.toHaveBeenCalled();

    // Verificar que next fue llamado con el request original sin modificar
    const passedRequest = nextHandlerSpy.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Authorization header for signin urls', () => {
    // Crear un request para una URL de signin
    const request = new HttpRequest<unknown>('POST', 'https://api.example.com/signin', null);

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que localStorage.getItem no fue llamado
    expect(mockLocalStorage.getItem).not.toHaveBeenCalled();

    // Verificar que next fue llamado con el request original sin modificar
    const passedRequest = nextHandlerSpy.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });
});

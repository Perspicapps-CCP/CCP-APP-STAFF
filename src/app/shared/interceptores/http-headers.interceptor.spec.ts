import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { httpHeadersInterceptor } from './http-headers.interceptor';
import { of } from 'rxjs';

describe('httpHeadersInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => httpHeadersInterceptor(req, next));

  let nextHandlerSpy: jasmine.Spy;
  let localStorageSpy: jasmine.Spy;
  let next: HttpHandlerFn;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // En lugar de espiar directamente localStorage.getItem, creamos un mock de localStorage
    // y restablecemos el spy en cada prueba
    if (localStorageSpy) {
      localStorageSpy.and.callThrough();
    }
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue('fake-token');

    // Espía para el handler next
    nextHandlerSpy = jasmine.createSpy('next').and.returnValue(of({}));
    next = nextHandlerSpy;
  });

  afterEach(() => {
    // Limpiar el spy después de cada prueba
    if (localStorageSpy) {
      localStorageSpy.and.callThrough();
    }
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header for non-login urls', () => {
    // Crear una solicitud para una URL que no incluye login
    const request = new HttpRequest<unknown>('GET', 'https://api.example.com/users');

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que se llamó a localStorage.getItem con 'token'
    expect(localStorage.getItem).toHaveBeenCalledWith('token');

    // Verificar que se llamó a next con una solicitud que contiene el header de autorización
    const modifiedRequest = nextHandlerSpy.calls.first().args[0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should not add Authorization header for login urls', () => {
    // Crear una solicitud para una URL que incluye login
    const request = new HttpRequest<unknown>('POST' as any, 'https://api.example.com/login');

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que no se llamó a localStorage.getItem
    expect(localStorage.getItem).not.toHaveBeenCalled();

    // Verificar que se llamó a next con la solicitud original sin modificar
    const passedRequest = nextHandlerSpy.calls.first().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Authorization header for signin urls', () => {
    // Crear una solicitud para una URL que incluye signin
    const request = new HttpRequest<unknown>('POST' as any, 'https://api.example.com/signin');

    // Ejecutar el interceptor
    interceptor(request, next);

    // Verificar que no se llamó a localStorage.getItem
    expect(localStorage.getItem).not.toHaveBeenCalled();

    // Verificar que se llamó a next con la solicitud original sin modificar
    const passedRequest = nextHandlerSpy.calls.first().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });
});

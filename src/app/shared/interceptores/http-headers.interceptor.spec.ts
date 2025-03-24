import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { httpHeadersInterceptor } from './http-headers.interceptor';
import { of } from 'rxjs';

describe('httpHeadersInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => httpHeadersInterceptor(req, next));

  let nextHandlerSpy: jasmine.Spy;
  let next: HttpHandlerFn;
  let localStorageGetItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // Instead of replacing localStorage, just spy on its getItem method
    localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.returnValue('fake-token');

    // Spy for the next handler
    nextHandlerSpy = jasmine.createSpy('next').and.returnValue(of({}));
    next = nextHandlerSpy;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header for non-login urls', () => {
    // Create a request for a non-login URL
    const request = new HttpRequest<unknown>('GET', 'https://api.example.com/users');

    // Execute the interceptor
    interceptor(request, next);

    // Verify localStorage.getItem was called with 'token'
    expect(localStorage.getItem).toHaveBeenCalledWith('token');

    // Verify next was called with a request containing the authorization header
    const modifiedRequest = nextHandlerSpy.calls.first().args[0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    expect(modifiedRequest.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should not add Authorization header for login urls', () => {
    // Reset the spy call count
    localStorageGetItemSpy.calls.reset();

    // Create a request for a login URL
    const request = new HttpRequest<unknown>('POST', 'https://api.example.com/login', null);

    // Execute the interceptor
    interceptor(request, next);

    // Verify localStorage.getItem was not called
    expect(localStorage.getItem).not.toHaveBeenCalled();

    // Verify next was called with the original request unmodified
    const passedRequest = nextHandlerSpy.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Authorization header for signin urls', () => {
    // Reset the spy call count
    localStorageGetItemSpy.calls.reset();

    // Create a request for a signin URL
    const request = new HttpRequest<unknown>('POST', 'https://api.example.com/signin', null);

    // Execute the interceptor
    interceptor(request, next);

    // Verify localStorage.getItem was not called
    expect(localStorage.getItem).not.toHaveBeenCalled();

    // Verify next was called with the original request unmodified
    const passedRequest = nextHandlerSpy.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(passedRequest.headers.has('Authorization')).toBeFalse();
  });
});

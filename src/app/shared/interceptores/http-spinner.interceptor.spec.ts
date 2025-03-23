import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';


import { httpSpinnerInterceptor } from './http-spinner.interceptor';
import { validateTokenGuard } from '../guards/validate-token.guard';
import { CanActivateChildFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('httpSpinnerInterceptor', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => validateTokenGuard(...guardParameters));

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => httpSpinnerInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should return true', () => {
    // Arrange: crear mocks para los parámetros del guard
    const childRouteMock = {} as ActivatedRouteSnapshot;
    const stateMock = {} as RouterStateSnapshot;

    // Act: ejecutar el guard con los parámetros de prueba
    const result = executeGuard(childRouteMock, stateMock);

    // Assert: verificar que el resultado sea true
    expect(result).toBe(true);
  });
});

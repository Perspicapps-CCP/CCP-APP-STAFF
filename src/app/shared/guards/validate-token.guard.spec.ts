import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { validateTokenGuard } from './validate-token.guard';

describe('validateTokenGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => validateTokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
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

import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { LoginService } from './login.service';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let router: Router;
  let originalLocalStorage: any;

  // Guarda las referencias originales antes de modificarlas
  beforeAll(() => {
    originalLocalStorage = {};
    originalLocalStorage.getItem = localStorage.getItem;
    originalLocalStorage.setItem = localStorage.setItem;
    originalLocalStorage.removeItem = localStorage.removeItem;
  });

  // Restaura las funciones originales después de todas las pruebas
  afterAll(() => {
    localStorage.getItem = originalLocalStorage.getItem;
    localStorage.setItem = originalLocalStorage.setItem;
    localStorage.removeItem = originalLocalStorage.removeItem;
  });

  beforeEach(() => {
    // Crear mocks nuevos para cada prueba
    const getItemSpy = jasmine.createSpy('getItem');
    const setItemSpy = jasmine.createSpy('setItem');
    const removeItemSpy = jasmine.createSpy('removeItem');

    // Asignar los spies directamente sin usar spyOn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy
      },
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in user and save data to localStorage', () => {
    const mockUser = { user: 'testuser', password: 'testpassword' };
    const mockResponse = {
      data: {
        usuario: {
          token: "14f8159c-3ca0-4842-8afe-862fa36f4e17",
          usuario: "Lazaro_Lebsack",
          nombres: "Ottis",
          apellidos: "Olson",
          fullName: "Ada Bailey",
          email: "Mckayla13@hotmail.com",
          phone: "Samson23@gmail.com"
        }
      }
    };

    spyOn(router, 'navigate');

    service.iniciarSesion(mockUser.user, mockUser.password).subscribe(usuario => {
      expect(usuario).toEqual(mockResponse.data.usuario);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockResponse.data.usuario.token);
      expect(localStorage.setItem).toHaveBeenCalledWith('usuario', JSON.stringify(mockResponse.data.usuario));
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should log out user and remove data from localStorage', () => {
    spyOn(router, 'navigate');

    service.cerrarSesion();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('usuario');
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should validate session', () => {
    const mockResponse = { isValid: true, usuario: { id: 1, nombre: 'Test User' } };

    service.validarSesion().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});

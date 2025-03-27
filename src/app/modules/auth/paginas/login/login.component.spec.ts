import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { LoginService } from '../../servicios/login.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { LocalizationService } from '../../../../shared/servicios/localization.service';

class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() { return 'es-ES'; }
  getLang() { return 'es'; }
  getCurrencyCode() { return 'EUR'; }
}

export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({});
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceMock: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    loginServiceMock = jasmine.createSpyObj('LoginService', ['iniciarSesion']);
    loginServiceMock.iniciarSesion.and.returnValue(of({
      "access_token": "e77c0b8a-a7b9-4c31-a524-a7c32e87b248",
      "user": {
        "id": "253e3e87-1981-4197-a140-eddb470b00af",
        "username": "Esteban.Bins",
        "email": "Nola_Wiza72@gmail.com",
        "role": "STAFF"
      }
    }));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        { provide: LoginService, useValue: loginServiceMock },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateService,
        TranslateStore,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call iniciarSesion when is correct form', () => {
    component.loginForm.controls['username'].setValue('a.clavijo@pruebas.com');
    component.loginForm.controls['password'].setValue('123456');

    component.iniciarSesion();
  });

  it('should show error message when iniciarSesion fails', () => {
    // Crear un spy para el snackBar.open
    const snackBarSpy = spyOn(component['_snackBar'], 'open');

    // Hacer que el servicio de login retorne un error
    loginServiceMock.iniciarSesion.and.returnValue(new Observable(observer => {
      observer.error('Error al iniciar sesión');
    }));

    // Configurar el translate service para retornar un mensaje cuando se solicite 'LOGIN.ERROR_MESSAGE'
    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'get').withArgs('LOGIN.ERROR_MESSAGE').and.returnValue(of('Error al iniciar sesión'));

    // Rellenar el formulario con datos válidos
    component.loginForm.controls['username'].setValue('usuario');
    component.loginForm.controls['password'].setValue('contraseña');

    // Llamar al método iniciarSesion
    component.iniciarSesion();

    // Verificar que se llamó al método open del snackBar con el mensaje traducido
    expect(translateService.get).toHaveBeenCalledWith('LOGIN.ERROR_MESSAGE');
    expect(snackBarSpy).toHaveBeenCalled();
    expect(snackBarSpy.calls.mostRecent().args[0]).toBe('Error al iniciar sesión');
    expect(snackBarSpy.calls.mostRecent().args[1]).toBe('');
    const snackBarArgs = snackBarSpy.calls.mostRecent().args[2];
    if (snackBarArgs) {
      expect(snackBarArgs.horizontalPosition).toBe('end');
    }
    if (snackBarArgs) {
      expect(snackBarArgs.verticalPosition).toBe('top');
    }
  });

  it('should call togglePasswordVisibility and validate password visibility', () => {
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    component.togglePasswordVisibility(passwordInput);
    expect(component.showPassword).toBe(true);
    expect(passwordInput.type).toBe('text');

    component.togglePasswordVisibility(passwordInput);
    expect(component.showPassword).toBe(false);
    expect(passwordInput.type).toBe('password');
  });

  it('should return error message for minlength field', () => {
    component.loginForm.controls['username'].setValue('ab');
    expect(component.getErrorMessage('username')).toBeTruthy();

    component.loginForm.controls['password'].setValue('ab');
    expect(component.getErrorMessage('password')).toBeTruthy();
  });

  it('should return empty when form no exist in loginForm', () => {
    expect(component.getErrorMessage('noExist')).toBeTruthy();
  });
});

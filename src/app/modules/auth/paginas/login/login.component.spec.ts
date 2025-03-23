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
      "token": "14f8159c-3ca0-4842-8afe-862fa36f4e17",
      "usuario": "Lazaro_Lebsack",
      "nombres": "Ottis",
      "apellidos": "Olson",
      "fullName": "Ada Bailey",
      "email": "Mckayla13@hotmail.com",
      "phone": "Samson23@gmail.com"
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
});

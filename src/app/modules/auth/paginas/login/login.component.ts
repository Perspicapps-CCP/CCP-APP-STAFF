import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../servicios/login.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-login',
  imports: [sharedImports, MatCardModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
  });

  showPassword = false;

  constructor(
    private loginService: LoginService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  togglePasswordVisibility(passwordInput: HTMLInputElement): void {
    this.showPassword = !this.showPassword;
    passwordInput.type = this.showPassword ? 'text' : 'password';
  }

  isInvalid(controlName: string) {
    return (
      this.loginForm.get(controlName)!.invalid &&
      (this.loginForm.get(controlName)!.dirty || this.loginForm.get(controlName)!.touched)
    );
  }

  getErrorMessage(controlName: string): Observable<string> {
    if (this.loginForm.get(controlName)?.hasError('required')) {
      return this.translate.get('LOGIN.FORM_ERRORS.FIELD_REQUIRED');
    }

    if (this.loginForm.get(controlName)?.hasError('minlength') && controlName === 'username') {
      return this.translate.get('LOGIN.FORM_ERRORS.USERNAME_MIN_LENGTH');
    }

    if (this.loginForm.get(controlName)?.hasError('minlength') && controlName === 'password') {
      return this.translate.get('LOGIN.FORM_ERRORS.PASSWORD_MIN_LENGTH');
    }

    return of('');
  }

  iniciarSesion() {
    const loginForm = this.loginForm.value;
    if (loginForm.username && loginForm.password) {
      this.loginService.iniciarSesion(loginForm.username, loginForm.password).subscribe({
        error: () => {
          this.translate.get('LOGIN.ERROR_MESSAGE').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000,
            });
          });
        },
      });
      console.log('Iniciar sesión');
    }
  }
}

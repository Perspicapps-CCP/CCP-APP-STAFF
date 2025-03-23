import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../servicios/login.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  imports: [
    sharedImports,
    MatCardModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)])
  });

  constructor(
    private loginService: LoginService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  iniciarSesion() {
    let loginForm = this.loginForm.value;
    if (loginForm.username && loginForm.password) {
      this.loginService.iniciarSesion(loginForm.username, loginForm.password).subscribe({
        error: () => {
          this.translate.get('LOGIN.ERROR_MESSAGE').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          });
        }
      });
      console.log('Iniciar sesión');
    }
  }
}

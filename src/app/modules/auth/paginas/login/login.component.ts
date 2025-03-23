import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../servicios/login.service';
@Component({
  selector: 'app-login',
  imports: [
    sharedImports,
    MatCardModule,
    ReactiveFormsModule
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
  ) { }

  iniciarSesion() {
    let loginForm = this.loginForm.value;
    if (loginForm.username && loginForm.password) {
      this.loginService.iniciarSesion(loginForm.username, loginForm.password).subscribe({
        next: (res) => {
          console.log('Inicio de sesión exitoso', res);
        },
        error: (err) => {
          console.error('Error al iniciar sesión', err);
        }
      });
      console.log('Iniciar sesión');
    }
  }
}

import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { sharedImports } from '../../../../shared/otros/shared-imports';
@Component({
  selector: 'app-login',
  imports: [
    sharedImports,
    MatCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


  iniciarSesion() {
    console.log('Iniciar sesión');
  }
}

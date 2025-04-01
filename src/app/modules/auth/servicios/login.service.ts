import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UsuarioService } from './usuario.service';
import { Login } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiUrlCCP;

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService,
  ) {}

  iniciarSesion(username: string, password: string) {
    return this.http.post<Login>(`${this.apiUrl}/api/v1/users/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.user));
        this.usuarioService.usuario = res;
        this.router.navigate(['/home']);
      }),
    );
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/auth/login']);
  }
}

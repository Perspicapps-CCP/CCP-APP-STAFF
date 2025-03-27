import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { Login, Usuario } from '../interfaces/usuario.interface';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

  iniciarSesion(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/users/login`, { username, password }).pipe(
      map<any, Login>((res: any) => {
        return res.data;
      }),
      tap((res) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('usuario', JSON.stringify(res.user));
        this.usuarioService.usuario = res;
        this.router.navigate(['/home']);
      })
    );
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/auth/login']);
  }

  validarSesion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { Usuario } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  iniciarSesion(user: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { user, password }).pipe(
      map<any, Usuario>((res: any) => {
        return res.data.usuario;
      }),
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res));
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

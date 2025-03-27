import { Injectable } from '@angular/core';
import { Login } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private _usuario: Login | undefined;
  constructor() { }

  get usuario(): Login | undefined {
    return this._usuario;
  }

  set usuario(usuario: Login) {
    this._usuario = usuario;
  }

  get token(): string {
    return this._usuario?.access_token || '';
  }
}

import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private _usuario: Usuario | undefined;
  constructor() { }

  get usuario(): Usuario | undefined {
    return this._usuario;
  }

  set usuario(usuario: Usuario) {
    this._usuario = usuario;
  }

  get token(): string {
    return this._usuario?.token || '';
  }
}

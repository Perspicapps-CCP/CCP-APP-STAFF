import { Injectable } from '@angular/core';
import { Vendedor } from '../interfaces/vendedores.interface';
import { Fabricante } from '../../fabricantes/interfaces/fabricantes.interface';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VendedoresService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerVendedores() {
    return this.http.get<Vendedor[]>(`${this.apiUrl}/sales/sellers`).pipe(
      map<any, Vendedor[]>((res: any) => {
        return res.data.vendedores;
      }),
    );
  }

  crearVendedor(vendedor: Vendedor) {
    return this.http.post<Vendedor>(`${this.apiUrl}/sales/sellers`, vendedor).pipe(
      map<any, Vendedor>((res: any) => {
        return res.data.vendedor;
      }),
    );
  }
}

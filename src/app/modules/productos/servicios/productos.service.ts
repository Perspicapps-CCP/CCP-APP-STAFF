import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../interfaces/productos.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private apiUrl = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  obtenerProductos() {
    return this.http.get<Producto[]>(`${this.apiUrl}/inventory/stock/products`);
  }
}

import { Injectable } from '@angular/core';
import { Venta } from '../interfaces/ventas.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private readonly apiUrl = environment.apiUrlCCP;

  constructor(private readonly http: HttpClient) {}

  obtenerVentas() {
    return this.http.get<Venta[]>(`${this.apiUrl}/api/v1/sales/sales/`);
  }

  obtenerUrlDescarga(): string {
    return `${this.apiUrl}/api/v1/sales/sales/export/`;
  }
}

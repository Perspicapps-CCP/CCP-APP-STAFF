import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  GenerarRutaEntregaPost,
  GenerarRutaEntregaResponse,
} from '../interfaces/generar-ruta-entrega-post';
import { RutaEntrega } from '../interfaces/rutas-entrega';
import { RutaEntregaMapa } from '../interfaces/ruta-entrega-mapa';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RutasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerRutasEntrega() {
    return this.http.get<RutaEntrega[]>(`${this.apiUrl}/logistic/delivery`).pipe(
      map((rutas: any) => {
        return rutas.rutas;
      }),
      map((rutas: RutaEntrega[]) => {
        return rutas.map((ruta: RutaEntrega) => {
          return {
            ...ruta,
            warehouse_name: ruta.warehouse.warehouse_name,
            orders: ruta.orders.map(order => {
              return {
                ...order,
                order_number_product: `${order.order_number}-${order.product_code}`,
              };
            }),
          };
        });
      }),
    );
  }

  obtenerRutaMapa(shipping_number: string): Observable<RutaEntregaMapa[]> {
    return this.http
      .get<RutaEntregaMapa[]>(`${this.apiUrl}/logistic/route/${shipping_number}`)
      .pipe(
        map((rutas: any) => {
          return rutas.coordenadas;
        }),
      );
  }

  generarRutasEntrega(rutaEntregaPost: GenerarRutaEntregaPost) {
    return this.http.post<GenerarRutaEntregaResponse>(
      `${this.apiUrl}/logistic/delivery/`,
      rutaEntregaPost,
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs';
import { Fabricante } from '../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../interfaces/producto-fabricante.interface';

@Injectable({
  providedIn: 'root'
})
export class FabricantesService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  obtenerFabricantes() {
    return this.http.get<Fabricante[]>(`${this.apiUrl}/fabricantes`).pipe(
      map<any, Fabricante[]>((res: any) => {
        return res.data.fabricantes;
      })
    );
  }

  obtenerProductosFabricante(fabricante: Fabricante) {
    return this.http.get<ProductoFabricante[]>(`${this.apiUrl}/productos-fabricante/${fabricante.id}`).pipe(
      map<any, ProductoFabricante[]>((res: any) => {
        return res.data.productos;
      }),
      map((productos: ProductoFabricante[]) => {
        return productos.map((producto: ProductoFabricante) => {
          return {
            ...producto,
            costoUnidadLocale: producto.costoUnidad.toString()
          };
        });
      })
    );
  }

  crearFabricante(fabricante: Fabricante) {
    return this.http.post<Fabricante>(`${this.apiUrl}/fabricantes`, fabricante).pipe(
      map<any, Fabricante>((res: any) => {
        return res.data.fabricante;
      })
    );
  }
}

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
  private apiUrl = environment.apiUrlCCP;

  constructor(
    private http: HttpClient,
  ) { }

  obtenerFabricantes() {
    return this.http.get<Fabricante[]>(`${this.apiUrl}/suppliers/manufacturers/`)
    // .pipe(
    //   // map<any, Fabricante[]>((res: any) => {
    //   //   return res.data.fabricantes;
    //   // })
    // );
  }

  obtenerProductosFabricante(fabricante?: Fabricante) {
    return this.http.get<ProductoFabricante[]>(`${this.apiUrl}/suppliers/manufacturers/products/${fabricante?.id ?? ''}/`).pipe(
      // map<any, ProductoFabricante[]>((res: any) => {
      //   return res.data.productos;
      // }),
      map((productos: ProductoFabricante[]) => {
        return productos.map((producto: ProductoFabricante) => {
          return {
            ...producto,
            costoUnidadLocale: producto.unit_cost.toString()
          };
        });
      })
    );
  }

  crearFabricante(fabricante: Fabricante) {
    return this.http.post<Fabricante>(`${this.apiUrl}/suppliers/manufacturers/`, fabricante)
    // .pipe(
    //   map<any, Fabricante>((res: any) => {
    //     return res.data.fabricante;
    //   })
    // );
  }
}

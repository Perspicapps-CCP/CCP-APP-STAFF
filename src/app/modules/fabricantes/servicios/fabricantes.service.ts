import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Fabricante } from '../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../interfaces/producto-fabricante.interface';
import { MasivoProductoResponse } from '../interfaces/masivo-productos-response';

@Injectable({
  providedIn: 'root',
})
export class FabricantesService {
  private apiUrl = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  obtenerFabricantes() {
    return this.http.get<Fabricante[]>(`${this.apiUrl}/suppliers/manufacturers/`);
  }

  obtenerProductosFabricante(fabricante: Fabricante) {
    return this.http
      .get<
        ProductoFabricante[]
      >(`${this.apiUrl}/suppliers/manufacturers/${fabricante.id}/products/`)
      .pipe(
        map((productos: ProductoFabricante[]) => {
          return productos.map((producto: ProductoFabricante) => {
            return {
              ...producto,
              costoUnidadLocale: producto.price.toString(),
            };
          });
        }),
      );
  }

  obtenerProductos(idsProductos: string[] = []) {
    return this.http.post<ProductoFabricante[]>(
      `${this.apiUrl}/suppliers/manufacturers/listProducts/`,
      {
        productsIds: idsProductos,
      },
    );
  }

  crearFabricante(fabricante: Fabricante) {
    return this.http.post<Fabricante>(`${this.apiUrl}/suppliers/manufacturers/`, fabricante);
  }

  cargaMasivaProductosFabricante(fabricante: Fabricante, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<MasivoProductoResponse>(
      `${this.apiUrl}/suppliers/manufacturers/${fabricante.id}/products/batch/`,
      formData,
    );
  }
}

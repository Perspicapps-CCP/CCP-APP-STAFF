import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Fabricante } from '../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../interfaces/producto-fabricante.interface';
import { MasivoProductoResponse } from '../interfaces/masivo-productos-response';
import { ProductoFabricanteImageResponse } from '../interfaces/producto-fabricante-image-response';

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

  obtenerProductos(idsProductos?: string[]) {
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

  cargarImagenesProducto(
    fabricante: Fabricante,
    producto: ProductoFabricante,
    files: FileList,
  ): Observable<ProductoFabricanteImageResponse> {
    const formData = new FormData();
    formData.append('product_id', producto.id);
    for (const file of Array.from(files)) {
      formData.append('product_image', file);
    }

    return this.http.post<ProductoFabricanteImageResponse>(
      `${this.apiUrl}/suppliers/manufacturers/${fabricante.id}/products/image/`,
      formData,
    );
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';
import { Bodega } from '../interfaces/bodega.interface';
import { ProductoBodega, ProductoBodegaInventario } from '../interfaces/producto-bodega';
import { MasivoProductosResponse } from '../interfaces/masivo-productos-bodega-response';
import { Fabricante } from '../../fabricantes/interfaces/fabricantes.interface';
import { Producto } from '../../productos/interfaces/productos.interface';
import { Pais } from '../interfaces/paises.interface';
import { Ciudad } from '../interfaces/ciudades.interface';

@Injectable({
  providedIn: 'root',
})
export class BodegasService {
  private apiUrl = environment.apiUrlCCP;
  private apiKey = 'U1o2V1lSMDh0b1B1YTVEM3hWTkdBOVB1UnI5WmhrRmw2YTVpQ2Nhcw==';

  constructor(private http: HttpClient) {}

  obtenerBodegas() {
    return this.http.get<Bodega[]>(`${this.apiUrl}/inventory/warehouse`);
  }

  obtenerProductosBodega(bodega: Bodega): Observable<ProductoBodega[]> {
    return this.http
      .get<
        ProductoBodegaInventario[]
      >(`${this.apiUrl}/inventory/stock?warehouse=${bodega.warehouse_id}`)
      .pipe(
        map<any, { productsIds: string[]; productosInventario: ProductoBodegaInventario[] }>(
          (res: any) => {
            const productosInventario = res;
            const productsIds = productosInventario.map((product: any) => product.product_id);
            return {
              productsIds,
              productosInventario,
            };
          },
        ),
        switchMap(({ productsIds, productosInventario }) => {
          return this.http
            .post<ProductoFabricante[]>(`${this.apiUrl}/suppliers/manufacturers/listProducts`, {
              idsProductos: productsIds,
            })
            .pipe(
              map(productosFabricante =>
                this.unionProductosBodega(productosInventario, productosFabricante),
              ),
            );
        }),
      );
  }

  unionProductosBodega(
    productosInventario: ProductoBodegaInventario[],
    productosFabricante: ProductoFabricante[],
  ): ProductoBodega[] {
    const productosBodega: ProductoBodega[] = [];

    productosInventario.forEach(productoInventario => {
      const productoFabricante = productosFabricante.find(
        producto => producto.id === productoInventario.product_id,
      );
      if (productoFabricante) {
        productosBodega.push({
          ...productoFabricante,
          quantity: productoInventario.quantity + '',
        });
      }
    });

    return productosBodega;
  }

  cargaMasivaProductosFabricante(bodega: Bodega, file: File) {
    const formData = new FormData();
    formData.append('inventory_upload', file);
    formData.append('warehouse_id', bodega.warehouse_id ?? '');

    return this.http.post<MasivoProductosResponse>(`${this.apiUrl}/inventory/stock/csv`, formData);
  }

  crearBodega(bodega: Bodega) {
    return this.http.post<Bodega>(`${this.apiUrl}/inventory/warehouse`, bodega);
  }

  obtenerPaises() {
    const headers = new HttpHeaders({
      'X-CSCAPI-KEY': this.apiKey,
    });
    return this.http.get<Pais[]>('https://api.countrystatecity.in/v1/countries', { headers });
  }

  obtenerCuidadesPais(iso2: string) {
    const headers = new HttpHeaders({
      'X-CSCAPI-KEY': this.apiKey,
    });
    return this.http.get<Ciudad[]>(`https://api.countrystatecity.in/v1/countries/${iso2}/cities`, {
      headers,
    });
  }
}

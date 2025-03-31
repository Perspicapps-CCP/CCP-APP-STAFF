import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';
import { Bodega } from '../interfaces/bodega.interface';
import { ProductoBodega, ProductoBodegaInventario } from '../interfaces/producto-bodega';

@Injectable({
  providedIn: 'root',
})
export class BodegasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerBodegas() {
    return this.http.get<Bodega[]>(`${this.apiUrl}/inventory/warehouse`).pipe(
      map<any, Bodega[]>((res: any) => {
        return res.data.warehouses;
      }),
    );
  }

  obtenerProductosBodega(bodega: Bodega): Observable<ProductoBodega[]> {
    return this.http
      .get<ProductoBodegaInventario[]>(`${this.apiUrl}/inventory?warehouse=${bodega.warehouse_id}`)
      .pipe(
        map<any, { productsIds: string[]; productosInventario: ProductoBodegaInventario[] }>(
          (res: any) => {
            const productosInventario = res.data.productos;
            const productsIds = productosInventario.map((product: any) => product.product_id);
            return {
              productsIds,
              productosInventario,
            };
          },
        ),
        switchMap(({ productsIds, productosInventario }) => {
          return this.http
            .post<ProductoFabricante[]>(`${this.apiUrl}/manufacturers/listProducts`, {
              idsProductos: productsIds,
            })
            .pipe(
              map<any, ProductoFabricante[]>((res: any) => {
                return res.data.productos;
              }),
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
}

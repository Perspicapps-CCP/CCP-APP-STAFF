import { Injectable } from '@angular/core';
import { Bodega } from '../interfaces/bodega.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';
import { ProductoBodega, ProductoBodegaInventario } from '../interfaces/producto-bodega';
import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';

@Injectable({
  providedIn: 'root'
})
export class BodegasService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  obtenerBodegas() {
    return this.http.get<Bodega[]>(`${this.apiUrl}/inventory/warehouse`).pipe(
      map<any, Bodega[]>((res: any) => {
        return res.data.warehouses;
      })
    );
  }

  obtenerProductosBodega(bodega: Bodega): Observable<ProductoBodega[]> {
    return this.http.get<ProductoBodegaInventario[]>(`${this.apiUrl}/inventory?warehouse=${bodega.warehouse_id}`).pipe(
      map<any, { productsIds: string[], productosInventario: ProductoBodegaInventario[] }>((res: any) => {
        const productosInventario = res.data.productos;
        const productsIds = productosInventario.map((product: any) => product.product_id);
        return {
          productsIds,
          productosInventario
        };
      }),
      switchMap(({ productsIds, productosInventario }) => {
        return this.http.post<ProductoFabricante[]>(`${this.apiUrl}/manufacturers/listProducts`, {
          idsProductos: productsIds,
        }).pipe(
          map<any, ProductoFabricante[]>((res: any) => {
            return res.data.productos;
          }),
          map(productosFabricante => this.unionProductosBodega(productosInventario, productosFabricante))
        );
      })
    );
  }


  unionProductosBodega(productosInventario: ProductoBodegaInventario[], productosFabricante: ProductoFabricante[]): ProductoBodega[] {
    let productosBodega: ProductoBodega[] = [];

    productosInventario.forEach((productoInventario) => {
      let productoFabricante = productosFabricante.find((producto) => producto.id === productoInventario.product_id);
      if (productoFabricante) {
        productosBodega.push({
          ...productoFabricante,
          quantity: productoInventario.quantity,
        });
      }
    });

    return productosBodega;
  }

}

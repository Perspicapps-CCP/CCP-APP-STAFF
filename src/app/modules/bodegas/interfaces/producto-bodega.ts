import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';

export interface ProductoBodegaInventario {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  last_update: Date;
}

export interface ProductoBodega extends ProductoFabricante {
  quantity: string;
}

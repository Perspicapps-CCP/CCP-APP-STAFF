import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';
import { Vendedor } from '../../vendedores/interfaces/vendedores.interface';

export interface PlanVenta {
  id: string;
  product_id: string;
  start_date: Date;
  end_date: Date;
  goal: string;
  sellers: Vendedor[];
  product: ProductoFabricante;
}

export interface PlanVentaPost {
  product_id: string;
  goal: number;
  start_date: Date;
  end_date: Date;
  seller_ids: string[];
}

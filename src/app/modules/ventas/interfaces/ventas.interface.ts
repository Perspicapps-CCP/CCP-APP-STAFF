import { ProductoFabricante } from '../../fabricantes/interfaces/producto-fabricante.interface';
import { Vendedor } from '../../vendedores/interfaces/vendedores.interface';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
export interface VentaProducto {
  id: string;
  product: ProductoFabricante;
  quantity: number;
  unit_price: number;
  total_value: number;
  created_at: Date;
  updated_at: Date;
}
export interface Venta {
  id: string;
  seller: Vendedor;
  client: Vendedor;
  order_number: number;
  address: Address;
  total_value: number;
  currency: string;
  items: VentaProducto[];
  created_at: Date;
  updated_at: Date;
}

export interface VentaTabla {
  id: string;
  order_number: string;
  seller_name: string;
  client_name: string;
  created_at: Date;
  total_value: string;
}

export interface VentaQuery {
  seller_id?: string;
  start_date?: string;
  end_date?: string;
  seller_name?: string;
  order_number?: number;
}

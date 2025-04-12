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
  order_number: number;
  address: Address;
  total_value: number;
  currency: string;
  items: VentaProducto[];
  created_at: Date;
  updated_at: Date;
}

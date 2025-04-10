import { ProductoBodega } from '../../bodegas/interfaces/producto-bodega';

export interface GenerarRutaEntregaPost {
  date: string;
  warehouse_id: string;
}

export interface GenerarRutaEntregaResponse {
  shipping_number: string;
  licence_plate: string;
  warehouse: Warehouse;
  delivery_status: string;
  order: Order;
}

export interface Order {
  order_number: string;
  order_address: string;
  customer_phone_number: string;
  product: ProductoBodega[];
}

export interface Warehouse {
  warehouse_id: string;
  warehouse_name: string;
}

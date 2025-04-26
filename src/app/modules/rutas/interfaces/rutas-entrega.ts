export interface RutaEntrega {
  shipping_number: string;
  license_plate: string;
  diver_name: string;
  warehouse: Warehouse;
  delivery_status: string;
  warehouse_name?: string;
  orders: Order[];
}

export interface Order {
  order_number_product: string;
  order_number: string;
  order_address: string;
  customer_phone_number: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  images: string[];
}

export interface Warehouse {
  warehouse_id: string;
  warehouse_name: string;
}

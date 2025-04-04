export interface ProductoFabricanteImageResponse {
  operation_id: string;
  product_id: string;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  created_at: Date;
}

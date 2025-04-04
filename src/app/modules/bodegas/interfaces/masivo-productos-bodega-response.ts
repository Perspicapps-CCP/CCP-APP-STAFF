export interface MasivoProductosResponse {
  operation_id: string;
  warehouse_id: string;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  created_at: Date;
}

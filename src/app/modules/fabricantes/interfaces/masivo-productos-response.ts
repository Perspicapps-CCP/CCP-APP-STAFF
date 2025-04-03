export interface MasivoProductoResponse {
  total_successful_records: number;
  total_errors_records: number;
  detail: Detail[];
}

export interface Detail {
  row_file: number;
  detail: string;
}

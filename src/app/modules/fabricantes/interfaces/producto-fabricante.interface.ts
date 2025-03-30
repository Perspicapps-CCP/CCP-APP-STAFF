export interface ProductoFabricante {
  id: string;
  name: string;
  product_code: string;
  unit_cost: number;
  costoUnidadLocale?: string;
  images: string[];
}

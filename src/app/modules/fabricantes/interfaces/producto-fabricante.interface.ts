export interface ProductoFabricante {
  id: string;
  nombre: string;
  codigoProducto: string;
  costoUnidad: number;
  costoUnidadLocale: string | null;
  imagenes: string[];
}

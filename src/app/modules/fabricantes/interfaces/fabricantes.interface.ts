export interface Fabricante {
  id?: string;
  nombre: string;
  identificacion: string;
  telefono: string;
  direccion: string;
  correo: string;
  productos: any[];
  expandido?: boolean;
}

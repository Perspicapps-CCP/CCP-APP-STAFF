import { Vendedor } from '../../vendedores/interfaces/vendedores.interface';

export interface PlanVenta {
  id: string;
  product_id: string;
  start_date: Date;
  end_date: Date;
  goal: string;
  sellers: Vendedor[];
}

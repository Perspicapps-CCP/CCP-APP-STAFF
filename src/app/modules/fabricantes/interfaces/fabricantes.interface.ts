export interface Fabricante {
  id?: string;
  manufacturer_name: string;
  identification_number: string;
  identification_type?: string;
  address: string;
  contact_phone: string;
  email: string;
  expandido?: boolean;
}

import { Routes } from '@angular/router';

export const VENDEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/vendedores/vendedores.component').then(c => c.VendedoresComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];

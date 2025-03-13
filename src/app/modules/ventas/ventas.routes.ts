import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/ventas/ventas.component')
      .then(c => c.VentasComponent)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/productos/productos.component')
      .then(c => c.ProductosComponent)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

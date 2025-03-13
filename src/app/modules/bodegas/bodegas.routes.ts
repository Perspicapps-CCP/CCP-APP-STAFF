import { Routes } from '@angular/router';

export const BODEGAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/bodegas/bodegas.component')
      .then(c => c.BodegasComponent)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

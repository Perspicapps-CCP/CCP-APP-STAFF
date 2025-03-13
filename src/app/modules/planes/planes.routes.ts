import { Routes } from '@angular/router';

export const PLANES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/planes/planes.component')
      .then(c => c.PlanesComponent)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

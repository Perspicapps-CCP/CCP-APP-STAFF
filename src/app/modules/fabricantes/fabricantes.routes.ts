import { Routes } from '@angular/router';

export const FABRICANTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/fabricantes/fabricantes.component')
      .then(c => c.FabricantesComponent)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

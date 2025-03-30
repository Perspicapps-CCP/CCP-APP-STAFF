import { Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/paginas/layout/layout.component';
import { validateTokenGuard } from './shared/guards/validate-token.guard';

export const routes: Routes = [
  // Ruta para el módulo de autenticación con lazy loading
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [validateTokenGuard],
    canActivateChild: [validateTokenGuard],
    children: [
      {
        path: 'bodegas',
        loadChildren: () => import('./modules/bodegas/bodegas.routes')
          .then(m => m.BODEGAS_ROUTES)
      },
      {
        path: 'fabricantes',
        loadChildren: () => import('./modules/fabricantes/fabricantes.routes')
          .then(m => m.FABRICANTES_ROUTES)
      },
      {
        path: 'planes',
        loadChildren: () => import('./modules/planes/planes.routes')
          .then(m => m.PLANES_ROUTES)
      },
      {
        path: 'productos',
        loadChildren: () => import('./modules/productos/productos.routes')
          .then(m => m.PRODUCTOS_ROUTES)
      },
      {
        path: 'rutas',
        loadChildren: () => import('./modules/rutas/rutas.routes')
          .then(m => m.RUTAS_ROUTES)
      },
      {
        path: 'vendedores',
        loadChildren: () => import('./modules/vendedores/vendedores.routes')
          .then(m => m.VENDEDORES_ROUTES)
      },
      {
        path: 'ventas',
        loadChildren: () => import('./modules/ventas/ventas.routes')
          .then(m => m.VENTAS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'rutas',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

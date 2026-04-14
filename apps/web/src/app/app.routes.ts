import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/product-grid.component').then(
        (m) => m.ProductGridComponent,
      ),
  },
  {
    path: 'products/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'admin/inventory',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/inventory-list.component').then(
        (m) => m.InventoryListComponent,
      ),
  },
  {
    path: 'admin/inventory/low-stock',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/low-stock.component').then(
        (m) => m.LowStockComponent,
      ),
  },
  {
    path: 'admin/inventory/:id',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/inventory-edit.component').then(
        (m) => m.InventoryEditComponent,
      ),
  },
];

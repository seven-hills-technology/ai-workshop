import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-grid.component').then(
        (m) => m.ProductGridComponent,
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: 'admin/inventory',
    loadComponent: () =>
      import('./features/admin/inventory-list.component').then(
        (m) => m.InventoryListComponent,
      ),
  },
  {
    path: 'admin/inventory/low-stock',
    loadComponent: () =>
      import('./features/admin/low-stock.component').then(
        (m) => m.LowStockComponent,
      ),
  },
  {
    path: 'admin/inventory/:id',
    loadComponent: () =>
      import('./features/admin/inventory-edit.component').then(
        (m) => m.InventoryEditComponent,
      ),
  },
];

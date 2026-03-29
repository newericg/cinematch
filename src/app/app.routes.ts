import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/discover/discover.component').then(m => m.DiscoverComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

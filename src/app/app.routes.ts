import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'curations',
    loadComponent: () =>
      import('./features/curations/curations.component').then(m => m.CurationsComponent),
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./features/discover/discover.component').then(m => m.DiscoverComponent),
  },
  {
    path: 'watchlist',
    loadComponent: () =>
      import('./features/watchlist/watchlist.component').then(m => m.WatchlistComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

import { Routes } from '@angular/router';
import { Screening } from './components/screening/screening';


// export const routes: Routes = [
//     { path: '', redirectTo: '/login', pathMatch: 'full' },
//     {
//         path: 'login',
//         loadComponent: () => import('./components/login/login').then(c => c.Login)
//     },
//     {
//         path: 'screening',
//         loadComponent: () => import('./components/screening/screening').then(c => c.Screening)
//     },
//     {
//         path: 'dashboard',
//         loadComponent: () => import('./components/dashboard/dashboard').then(c => c.Dashboard)
//     },
//     {
//         path: 'providers',
//         loadComponent: () => import('./components/providers/providers').then(c => c.Providers)
//     },
//     {
//         path: 'campaigns',
//         loadComponent: () => import('./components/campaigns/campaigns').then(c => c.Campaigns)
//     },
//     {
//         path: 'monitoring',
//         loadComponent: () => import('./components/monitoring/monitoring').then(c => c.Monitoring)
//     },
//     {
//         path: 'reports',
//         loadComponent: () => import('./components/reports/reports').then(c => c.Reports)
//     },
//     {
//         path: 'settings',
//         loadComponent: () => import('./components/settings/settings').then(c => c.Settings)
//     },
//     {
//         path: '**',
//         loadComponent: () => import('./components/not-found/not-found').then(c => c.NotFound)
//     }

// ];
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(c => c.Login),
  },

  {
    path: '',
    component: Screening,           // parent with sidebar
    children: [
      {
        path: 'screening',
        loadComponent: () =>
          import('./components/screening/screening').then(c => c.Screening),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(c => c.Dashboard),
      },
      {
        path: 'providers',
        loadComponent: () =>
          import('./components/providers/providers').then(c => c.Providers),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./components/campaigns/campaigns').then(c => c.Campaigns),
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./components/monitoring/monitoring').then(c => c.Monitoring),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./components/reports/reports').then(c => c.Reports),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings').then(c => c.Settings),
      },
      {
        path:'create-campaigns',
        loadComponent: () =>
          import('./components/create-campaigns/create-campaigns').then(c => c.CreateCampaigns),
      }
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found').then(c => c.NotFound),
  },
];
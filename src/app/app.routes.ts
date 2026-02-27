import { Routes } from '@angular/router';
import { Screening } from './components/screening/screening';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(c => c.Login),
  },

  {
    path: '',
    component: Screening,
    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(c => c.Dashboard),
      },
      {
        path:'help-support',
        loadComponent: () =>
          import('./components/help-and-support/help-and-support').then(c => c.HelpAndSupport),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/my-profile/my-profile').then(c => c.MyProfile),
      },
      {
        path: 'providers',
        loadComponent: () =>
          import('./components/providers/providers').then(c => c.Providers),
      },
      {
        path: 'create-campaigns',
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
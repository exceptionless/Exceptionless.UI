import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('../pages/auth/auth.module').then((m) => m.AuthPageModule)
  }
];

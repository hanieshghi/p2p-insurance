import {Routes} from '@angular/router';

export const fullRout: Routes = [
  {path: 'auth', loadChildren: () => import('../../components/auth/auth.module').then(m => m.AuthModule)},
  {path: 'pages', loadChildren: () => import('../../pages/pages.module').then(m => m.PagesModule)}
];

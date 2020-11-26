import {Routes} from '@angular/router';

export const contentRout: Routes = [
  {path: 'panel', loadChildren: () => import('../../components/panel/panel.module').then(m => m.PanelModule)}
];

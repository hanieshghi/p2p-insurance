import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FullLayoutComponent} from './layouts/full-layout/full-layout.component';
import {fullRout} from './share/routes/fullRout';
import {contentRout} from './share/routes/contentRout';
import {ContentLayoutComponent} from './layouts/content-layout/content-layout.component';

const routes: Routes = [
  {path: '', redirectTo: 'panel/user', pathMatch: 'full'},
  {path: '', component: FullLayoutComponent, children: fullRout},
  {path: '', component: ContentLayoutComponent, children: contentRout},
  {path: '**', redirectTo: 'pages/404', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

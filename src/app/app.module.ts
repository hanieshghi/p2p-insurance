import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FullLayoutComponent} from './layouts/full-layout/full-layout.component';
import {ContentLayoutComponent} from './layouts/content-layout/content-layout.component';
import { FooterComponent } from './share/components/footer/footer.component';
import { HeaderComponent } from './share/components/header/header.component';
import { SideNavComponent } from './share/components/side-nav/side-nav.component';

@NgModule({
  declarations: [
    AppComponent,
    FullLayoutComponent,
    ContentLayoutComponent,
    FooterComponent,
    HeaderComponent,
    SideNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

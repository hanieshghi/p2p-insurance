import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelRoutingModule } from './panel-routing.module';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [UserComponent, AdminComponent],
    imports: [
        CommonModule,
        PanelRoutingModule,
        FormsModule
    ]
})
export class PanelModule { }

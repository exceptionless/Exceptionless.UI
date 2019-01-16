import { NgModule } from '@angular/core';
import { OrganizationRoutingModule } from './organization-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { SharedModule } from '../../../shared/shared.module';


import {OrganizationListComponent} from './organization-list/organization-list.component';
import {OrganizationEditComponent} from './organization-edit/organization-edit.component';
import {UserComponent} from '../../user/user.component';
import {InvoicesComponent} from '../../invoices/invoices.component';
import {OrganizationComponent} from './organization.component';

@NgModule({
    imports: [
        OrganizationRoutingModule,
        HttpClientModule,
        SharedModule
    ],
    declarations: [
        OrganizationListComponent,
        OrganizationEditComponent,
        UserComponent,
        InvoicesComponent,
        OrganizationComponent
    ]
})
export class OrganizationModule {}

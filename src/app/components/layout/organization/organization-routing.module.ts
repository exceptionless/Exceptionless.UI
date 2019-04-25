import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import {OrganizationListComponent} from "./organization-list/organization-list.component";
import {OrganizationEditComponent} from "./organization-edit/organization-edit.component";


const routes: Routes = [
    { path: "list", component: OrganizationListComponent },
    { path: ":id/manage", component: OrganizationEditComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrganizationRoutingModule { }

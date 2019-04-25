import { NgModule } from "@angular/core";
import { ProjectRoutingModule } from "./project-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "../../../shared/shared.module";

import {ProjectComponent} from "./project.component";
import {ProjectListComponent} from "./project-list/project-list.component";
import {ProjectNewComponent} from "./project-new/project-new.component";
import {ProjectEditComponent} from "./project-edit/project-edit.component";
import {ProjectConfigureComponent} from "./project-configure/project-configure.component";

@NgModule({
    imports: [
        ProjectRoutingModule,
        HttpClientModule,
        SharedModule
    ],
    declarations: [
        ProjectListComponent,
        ProjectNewComponent,
        ProjectEditComponent,
        ProjectConfigureComponent,
        ProjectComponent
    ]
})
export class ProjectModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {ProjectListComponent} from './project-list/project-list.component';
import {ProjectNewComponent} from './project-new/project-new.component';
import {ProjectEditComponent} from './project-edit/project-edit.component';
import {ProjectConfigureComponent} from './project-configure/project-configure.component';


const routes: Routes = [
    { path: 'list', component: ProjectListComponent },
    { path: 'add', component: ProjectNewComponent },
    { path: ':id/manage', component: ProjectEditComponent },
    { path: ':id/configure', component: ProjectConfigureComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }

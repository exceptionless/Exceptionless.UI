import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './service/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { TypeComponent } from './type/type.component';
import { ReportsComponent } from './type/reports/reports.component';
import { AdminComponent } from './type/admin/admin.component';
import { ProjectComponent } from './type/admin/project/project.component';
import { ProjectListComponent } from './type/admin/project/project-list/project-list.component';
import { ProjectNewComponent } from './type/admin/project/project-new/project-new.component';
import { ProjectEditComponent } from './type/admin/project/project-edit/project-edit.component';
import { OrganizationComponent } from './type/admin/organization/organization.component';
import { OrganizationListComponent } from './type/admin/organization/organization-list/organization-list.component';
import { OrganizationEditComponent } from './type/admin/organization/organization-edit/organization-edit.component';
import { AccountManageComponent } from './type/admin/account-manage/account-manage.component';
import { DocumentationComponent } from './type/documentation/documentation.component';
import { SupportComponent } from './type/support/support.component';
import { DashboardComponent } from './type/common/dashboard/dashboard.component';
import { RecentComponent } from './type/common/recent/recent.component';
import { FrequentComponent } from './type/common/frequent/frequent.component';
import { UsersComponent } from './type/common/users/users.component';
import { NewComponent } from './type/common/new/new.component';
import { StackComponent } from './type/components/stack/stack.component';
import {EventComponent} from "./type/components/event/event.component";

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    {
        path: 'type',
        component: TypeComponent,
        children: [
            { path: ':type/dashboard', component: DashboardComponent },
            { path: ':project_type/:id/:type/dashboard', component: DashboardComponent },
            { path: ':type/recent', component: RecentComponent },
            { path: ':project_type/:id/:type/recent', component: RecentComponent },
            { path: ':type/frequent', component: FrequentComponent },
            { path: ':project_type/:id/:type/frequent', component: FrequentComponent },
            { path: ':type/users', component: UsersComponent },
            { path: ':project_type/:id/:type/users', component: UsersComponent },
            { path: ':type/new', component: NewComponent },
            { path: ':project_type/:id/:type/new', component: NewComponent },
            {
                path: 'project',
                component: ProjectComponent,
                children: [
                    { path: 'list', component: ProjectListComponent },
                    { path: 'add', component: ProjectNewComponent },
                    { path: ':id/manage', component: ProjectEditComponent },
                ]
            },
            {
                path: 'organization',
                component: OrganizationComponent,
                children: [
                    { path: 'list', component: OrganizationListComponent },
                    { path: ':id/manage', component: OrganizationEditComponent },
                ]
            },
            { path: 'account/manage', component: AccountManageComponent },
            { path: 'stack/:id', component: StackComponent },
            { path: 'event/:id', component: EventComponent }
        ],
        canActivate: [AuthGuard],
    },
    { path: 'session/dashboard',    component: ReportsComponent, canActivate: [AuthGuard]},
    { path: '',   redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './service/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { TypeComponent } from './type/type.component';
import { ProjectComponent } from './type/components/project/project.component';
import { ProjectListComponent } from './type/components/project/project-list/project-list.component';
import { ProjectNewComponent } from './type/components/project/project-new/project-new.component';
import { ProjectEditComponent } from './type/components/project/project-edit/project-edit.component';
import { OrganizationComponent } from './type/components/organization/organization.component';
import { OrganizationListComponent } from './type/components/organization/organization-list/organization-list.component';
import { OrganizationEditComponent } from './type/components/organization/organization-edit/organization-edit.component';
import { AccountManageComponent } from './type/components/account-manage/account-manage.component';
import { DashboardComponent } from './type/components/dashboard/dashboard.component';
import { RecentComponent } from './type/components/recent/recent.component';
import { FrequentComponent } from './type/components/frequent/frequent.component';
import { UsersComponent } from './type/components/users/users.component';
import { NewComponent } from './type/components/new/new.component';
import { StackComponent } from './type/components/stack/stack.component';
import { EventComponent } from './type/components/event/event.component';
import { SessionComponent } from './type/components/session/session.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:id', component: ResetPasswordComponent },
    {
        path: 'type',
        component: TypeComponent,
        children: [
            { path: 'session/dashboard',    component: SessionComponent },
            { path: ':type/dashboard', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: ':project_type/:id/:type/dashboard', component: DashboardComponent },
            { path: ':project_type/:id/dashboard', component: DashboardComponent },
            { path: ':type/recent', component: RecentComponent },
            { path: 'recent', component: RecentComponent },
            { path: ':project_type/:id/:type/recent', component: RecentComponent },
            { path: ':project_type/:id/recent', component: RecentComponent },
            { path: ':type/frequent', component: FrequentComponent },
            { path: 'frequent', component: FrequentComponent },
            { path: ':project_type/:id/:type/frequent', component: FrequentComponent },
            { path: ':project_type/:id/frequent', component: FrequentComponent },
            { path: ':type/users', component: UsersComponent },
            { path: 'users', component: UsersComponent },
            { path: ':project_type/:id/:type/users', component: UsersComponent },
            { path: ':project_type/:id/users', component: UsersComponent },
            { path: ':type/new', component: NewComponent },
            { path: 'new', component: NewComponent },
            { path: ':project_type/:id/:type/new', component: NewComponent },
            { path: ':project_type/:id/new', component: NewComponent },
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
    { path: '',   redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

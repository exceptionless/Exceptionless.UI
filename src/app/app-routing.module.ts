import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './service/auth-guard.service';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { ProjectComponent } from './components/layout/project/project.component';
import { ProjectListComponent } from './components/layout/project/project-list/project-list.component';
import { ProjectNewComponent } from './components/layout/project/project-new/project-new.component';
import { ProjectEditComponent } from './components/layout/project/project-edit/project-edit.component';
import { OrganizationComponent } from './components/layout/organization/organization.component';
import { OrganizationListComponent } from './components/layout/organization/organization-list/organization-list.component';
import { OrganizationEditComponent } from './components/layout/organization/organization-edit/organization-edit.component';
import { AccountManageComponent } from './components/account-manage/account-manage.component';
import { DashboardComponent } from './components/layout/dashboard/dashboard.component';
import { RecentComponent } from './components/layout/recent/recent.component';
import { FrequentComponent } from './components/layout/frequent/frequent.component';
import { UsersComponent } from './components/layout/users/users.component';
import { NewComponent } from './components/layout/new/new.component';
import { StackComponent } from './components/layout/stack/stack.component';
import { EventComponent } from './components/layout/event/event.component';
import { SessionComponent } from './components/layout/session/session.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ProjectConfigureComponent } from './components/layout/project/project-configure/project-configure.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:tokenId', component: ResetPasswordComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'type/:type/dashboard', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: ':project_type/:id/:type/dashboard', component: DashboardComponent },
            { path: ':project_type/:id/dashboard', component: DashboardComponent },
            { path: 'type/:type/recent', component: RecentComponent },
            { path: 'recent', component: RecentComponent },
            { path: ':project_type/:id/:type/recent', component: RecentComponent },
            { path: ':project_type/:id/recent', component: RecentComponent },
            { path: 'type/:type/frequent', component: FrequentComponent },
            { path: 'frequent', component: FrequentComponent },
            { path: ':project_type/:id/:type/frequent', component: FrequentComponent },
            { path: ':project_type/:id/frequent', component: FrequentComponent },
            { path: 'type/:type/users', component: UsersComponent },
            { path: 'users', component: UsersComponent },
            { path: ':project_type/:id/:type/users', component: UsersComponent },
            { path: ':project_type/:id/users', component: UsersComponent },
            { path: 'type/:type/new', component: NewComponent },
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
                    { path: ':id/configure', component: ProjectConfigureComponent },
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
            { path: 'event/:id', component: EventComponent },
            { path: 'session/dashboard', component: SessionComponent },
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

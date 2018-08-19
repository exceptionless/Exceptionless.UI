import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from './service/auth-guard.service';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { ProjectComponent } from './components/project/project.component';
import { ProjectListComponent } from './components/project/project-list/project-list.component';
import { ProjectNewComponent } from './components/project/project-new/project-new.component';
import { ProjectEditComponent } from './components/project/project-edit/project-edit.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { OrganizationListComponent } from './components/organization/organization-list/organization-list.component';
import { OrganizationEditComponent } from './components/organization/organization-edit/organization-edit.component';
import { AccountManageComponent } from './components/account-manage/account-manage.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RecentComponent } from './components/recent/recent.component';
import { FrequentComponent } from './components/frequent/frequent.component';
import { UsersComponent } from './components/users/users.component';
import { NewComponent } from './components/new/new.component';
import { StackComponent } from './components/stack/stack.component';
import { EventComponent } from './components/event/event.component';
import { SessionComponent } from './components/session/session.component';

const routes: Routes = [
    { path: 'session/dashboard',    component: SessionComponent, canActivate: [AuthGuard] },
    { path: 'type/:type/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/:type/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'type/:type/recent', component: RecentComponent, canActivate: [AuthGuard] },
    { path: 'recent', component: RecentComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/:type/recent', component: RecentComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/recent', component: RecentComponent, canActivate: [AuthGuard] },
    { path: 'type/:type/frequent', component: FrequentComponent, canActivate: [AuthGuard] },
    { path: 'frequent', component: FrequentComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/:type/frequent', component: FrequentComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/frequent', component: FrequentComponent, canActivate: [AuthGuard] },
    { path: 'type/:type/users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/:type/users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/users', component: UsersComponent, canActivate: [AuthGuard] },
    { path: 'type/:type/new', component: NewComponent, canActivate: [AuthGuard] },
    { path: 'new', component: NewComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/:type/new', component: NewComponent, canActivate: [AuthGuard] },
    { path: ':project_type/:id/new', component: NewComponent, canActivate: [AuthGuard] },
    {
        path: 'project',
        component: ProjectComponent,
        children: [
            { path: 'list', component: ProjectListComponent },
            { path: 'add', component: ProjectNewComponent },
            { path: ':id/manage', component: ProjectEditComponent },
        ],
        canActivate: [AuthGuard]
    },
    {
        path: 'organization',
        component: OrganizationComponent,
        children: [
            { path: 'list', component: OrganizationListComponent },
            { path: ':id/manage', component: OrganizationEditComponent },
        ],
        canActivate: [AuthGuard]
    },
    { path: 'account/manage', component: AccountManageComponent, canActivate: [AuthGuard] },
    { path: 'stack/:id', component: StackComponent, canActivate: [AuthGuard] },
    { path: 'event/:id', component: EventComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:tokenId', component: ResetPasswordComponent },
    { path: '',   redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

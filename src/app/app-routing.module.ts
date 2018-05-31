import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { TypeComponent } from './type/type.component';
import { ErrorComponent } from './type/error/error.component';
import { ErrorDashboardComponent } from './type/error/error-dashboard/error-dashboard.component';
import { ErrorRecentComponent } from './type/error/error-recent/error-recent.component';
import { ErrorFrequentComponent } from './type/error/error-frequent/error-frequent.component';
import { ErrorUsersComponent } from './type/error/error-users/error-users.component';
import { ErrorNewComponent } from './type/error/error-new/error-new.component';
import { LogComponent } from './type/log/log.component';
import { LogDashboardComponent } from "./type/log/log-dashboard/log-dashboard.component"
import { LogFrequentComponent } from "./type/log/log-frequent/log-frequent.component"
import { LogNewComponent } from "./type/log/log-new/log-new.component"
import { LogRecentComponent } from "./type/log/log-recent/log-recent.component"
import { LogUsersComponent } from "./type/log/log-users/log-users.component"
import { BrokenComponent } from './type/broken/broken.component';
import { BrokenDashboardComponent } from "./type/broken/broken-dashboard/broken-dashboard.component"
import { BrokenFrequentComponent } from "./type/broken/broken-frequent/broken-frequent.component"
import { BrokenNewComponent } from "./type/broken/broken-new/broken-new.component"
import { BrokenRecentComponent } from "./type/broken/broken-recent/broken-recent.component"
import { BrokenUsersComponent } from "./type/broken/broken-users/broken-users.component"
import { FeatureComponent } from './type/feature/feature.component';
import { FeatureDashboardComponent } from "./type/feature/feature-dashboard/feature-dashboard.component"
import { FeatureFrequentComponent } from "./type/feature/feature-frequent/feature-frequent.component"
import { FeatureNewComponent } from "./type/feature/feature-new/feature-new.component"
import { FeatureRecentComponent } from "./type/feature/feature-recent/feature-recent.component"
import { FeatureUsersComponent } from "./type/feature/feature-users/feature-users.component"
import { EventsComponent } from './type/events/events.component';
import { EventsDashboardComponent } from "./type/events/events-dashboard/events-dashboard.component"
import { EventsFrequentComponent } from "./type/events/events-frequent/events-frequent.component"
import { EventsNewComponent } from "./type/events/events-new/events-new.component"
import { EventsRecentComponent } from "./type/events/events-recent/events-recent.component"
import { EventsUsersComponent } from "./type/events/events-users/events-users.component"
import { ReportsComponent } from './type/reports/reports.component';
import { AdminComponent } from './type/admin/admin.component';
import { ProjectComponent } from "./type/admin/project/project.component"
import { OrganizationComponent } from "./type/admin/organization/organization.component"
import  { AccountManageComponent } from "./type/admin/account-manage/account-manage.component"
import { DocumentationComponent } from './type/documentation/documentation.component';
import { SupportComponent } from './type/support/support.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    {
        path: 'type',
        component: TypeComponent,
        children: [
            {   path: 'error',
                component: ErrorComponent,
                children: [
                    { path: 'dashboard', component: ErrorDashboardComponent },
                    { path: 'recent', component: ErrorRecentComponent },
                    { path: 'frequent', component: ErrorFrequentComponent },
                    { path: 'users', component: ErrorUsersComponent },
                    { path: 'new', component: ErrorNewComponent },
                ]
            },
            {   path: 'log',
                component: LogComponent,
                children: [
                    { path: 'dashboard', component: LogDashboardComponent },
                    { path: 'recent', component: LogRecentComponent },
                    { path: 'frequent', component: LogFrequentComponent },
                    { path: 'users', component: LogUsersComponent },
                    { path: 'new', component: LogNewComponent },
                ]
            },
            {   path: '404',
                component: BrokenComponent,
                children: [
                    { path: 'dashboard', component: BrokenDashboardComponent },
                    { path: 'recent', component: BrokenRecentComponent },
                    { path: 'frequent', component: BrokenFrequentComponent },
                    { path: 'users', component: BrokenUsersComponent },
                    { path: 'new', component: BrokenNewComponent },
                ]
            },
            {   path: 'usage',
                component: FeatureComponent,
                children: [
                    { path: 'dashboard', component: FeatureDashboardComponent },
                    { path: 'recent', component: FeatureRecentComponent },
                    { path: 'frequent', component: FeatureFrequentComponent },
                    { path: 'users', component: FeatureUsersComponent },
                    { path: 'new', component: FeatureNewComponent },
                ]
            },
            {   path: 'events',
                component: EventsComponent,
                children: [
                    { path: 'dashboard', component: EventsDashboardComponent },
                    { path: 'recent', component: EventsRecentComponent },
                    { path: 'frequent', component: EventsFrequentComponent },
                    { path: 'users', component: EventsUsersComponent },
                    { path: 'new', component: EventsNewComponent },
                ]
            },
            {   path: 'session',
                component: ReportsComponent,
                children: [

                ]
            },
            {   path: 'admin',
                component: AdminComponent,
                children: [
                    { path: 'project', component: ProjectComponent },
                    { path: 'organization', component: OrganizationComponent },
                    { path: 'account/manage', component: OrganizationComponent },
                ]
            },
            {   path: 'documentation',
                component: DocumentationComponent,
                children: [

                ]
            },
            {   path: 'support',
                component: SupportComponent,
                children: [

                ]
            },
        ]
    },
    { path: '',   redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}

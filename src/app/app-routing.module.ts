import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { TypeComponent } from './type/type.component';
import { ErrorComponent } from './type/error/error.component';
import { LogComponent } from './type/log/log.component';
import { BrokenComponent } from './type/broken/broken.component';
import { FeatureComponent } from './type/feature/feature.component';
import { EventsComponent } from './type/events/events.component';
import { ReportsComponent } from './type/reports/reports.component';
import { AdminComponent } from './type/admin/admin.component';
import { DocumentationComponent } from './type/documentation/documentation.component';
import { SupportComponent } from './type/support/support.component';
import { ErrorDashboardComponent } from './type/error/error-dashboard/error-dashboard.component';

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
                    { path: 'dashboard', component: ErrorDashboardComponent }
                ]
            },
            {   path: 'log',
                component: LogComponent,
                children: [

                ]
            },
            {   path: '404',
                component: BrokenComponent,
                children: [

                ]
            },
            {   path: 'usage',
                component: FeatureComponent,
                children: [

                ]
            },
            {   path: 'events',
                component: EventsComponent,
                children: [

                ]
            },
            {   path: 'reports',
                component: ReportsComponent,
                children: [

                ]
            },
            {   path: 'admin',
                component: AdminComponent,
                children: [

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

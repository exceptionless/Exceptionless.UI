import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Ng2UiAuthModule } from 'ng2-ui-auth';

import { ToastrModule } from 'ngx-toastr';
import { LockerModule } from 'angular-safeguard';

import { GlobalVariables } from './global-variables';

import 'd3';
import 'rickshaw';
import { RickshawModule } from 'ng2-rickshaw';

import { ModalDialogModule } from 'ngx-modal-dialog';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DaterangepickerModule } from 'angular-2-daterangepicker';

import { ChecklistModule } from 'angular-checklist';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { SignupComponent } from './auth/signup/signup.component';

import { TokenInterceptor } from './service/token.interceptor';
import { AuthGuardService } from './service/auth-guard.service';
import { TypeComponent } from './type/type.component';
import { HeaderComponent } from './type/includes/header/header.component';
import { SidebarComponent } from './type/includes/sidebar/sidebar.component';
import { SearchFilterComponent } from './type/components/search-filter/search-filter.component';
import { ProjectFilterComponent } from './type/components/project-filter/project-filter.component';
import { DateFilterComponent } from './type/components/date-filter/date-filter.component';
import { ReportsComponent } from './type/reports/reports.component';
import { AdminComponent } from './type/admin/admin.component';
import { DocumentationComponent } from './type/documentation/documentation.component';
import { SupportComponent } from './type/support/support.component';
import { ProjectComponent } from './type/admin/project/project.component';
import { OrganizationComponent } from './type/admin/organization/organization.component';
import { AccountManageComponent } from './type/admin/account-manage/account-manage.component';
import { OpenDirective } from './directives/open.directive';
import { DashboardComponent } from './type/common/dashboard/dashboard.component';
import { RecentComponent } from './type/common/recent/recent.component';
import { UsersComponent } from './type/common/users/users.component';
import { NewComponent } from './type/common/new/new.component';
import { FrequentComponent } from './type/common/frequent/frequent.component';
import { OrganizationNotificationComponent } from './type/components/organization-notification/organization-notification.component';
import { OrganizationService } from './service/organization.service';
import { FilterService } from './service/filter.service';
import { DialogService } from './service/dialog.service';
import { RickshawComponent } from './type/components/rickshaw/rickshaw.component';
import { ConfirmDialogComponent } from './type/confirm-dialog/confirm-dialog.component';
import { ProjectListComponent } from './type/admin/project/project-list/project-list.component';
import { ProjectNewComponent } from './type/admin/project/project-new/project-new.component';
import { OrganizationNewComponent } from './type/admin/organization/organization-new/organization-new.component';
import { OrganizationListComponent } from './type/admin/organization/organization-list/organization-list.component';
import { ProjectEditComponent } from './type/admin/project/project-edit/project-edit.component';
import { OrganizationEditComponent } from './type/admin/organization/organization-edit/organization-edit.component';
import { CustomDateRangeDialogComponent } from './type/custom-date-range-dialog/custom-date-range-dialog.component';
import { SummaryComponent } from './type/components/summary/summary.component';
import { StacksComponent } from './type/components/stacks/stacks.component';
import { EventsComponent } from './type/components/events/events.component';
import { TimeagoComponent } from './type/components/timeago/timeago.component';
import { RelativeTimeComponent } from './type/components/relative-time/relative-time.component';

export const AuthConfig = {
    defaultHeaders: {'Content-Type': 'application/json'},
    providers: {
        google: { clientId: '' },
        facebook: { clientId: '' }
    },
    tokenName: 'token',
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        SignupComponent,
        TypeComponent,
        HeaderComponent,
        SidebarComponent,
        SearchFilterComponent,
        ProjectFilterComponent,
        DateFilterComponent,
        ReportsComponent,
        AdminComponent,
        DocumentationComponent,
        SupportComponent,
        ProjectComponent,
        OrganizationComponent,
        AccountManageComponent,
        OpenDirective,
        DashboardComponent,
        RecentComponent,
        UsersComponent,
        NewComponent,
        FrequentComponent,
        OrganizationNotificationComponent,
        RickshawComponent,
        StacksComponent,
        EventsComponent,
        ConfirmDialogComponent,
        ProjectListComponent,
        ProjectNewComponent,
        OrganizationNewComponent,
        OrganizationListComponent,
        ProjectEditComponent,
        OrganizationEditComponent,
        CustomDateRangeDialogComponent,
        SummaryComponent,
        TimeagoComponent,
        RelativeTimeComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot(), // ToastrModule added
        LockerModule,
        RickshawModule,
        ModalDialogModule.forRoot(),
        NgbModule.forRoot(),
        DaterangepickerModule,
        ChecklistModule,
        Ng2UiAuthModule.forRoot(AuthConfig),
    ],
    providers: [
        GlobalVariables,
        AuthGuardService,
        OrganizationService,
        FilterService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    entryComponents: [ConfirmDialogComponent, CustomDateRangeDialogComponent]
})

export class AppModule {
}

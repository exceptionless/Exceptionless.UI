import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { SignupComponent } from './auth/signup/signup.component';

import { BasicService } from './service/basic.service';
import { AuthService } from './service/auth.service';
import { TypeComponent } from './type/type.component';
import { ErrorComponent } from './type/error/error.component';
import { HeaderComponent } from './type/includes/header/header.component';
import { SidebarComponent } from './type/includes/sidebar/sidebar.component';
import { SearchFilterComponent } from './type/includes/search-filter/search-filter.component';
import { ProjectFilterComponent } from './type/includes/project-filter/project-filter.component';
import { DateFilterComponent } from './type/includes/date-filter/date-filter.component';
import { ErrorDashboardComponent } from './type/error/error-dashboard/error-dashboard.component';
import { LogComponent } from './type/log/log.component';
import { BrokenComponent } from './type/broken/broken.component';
import { FeatureComponent } from './type/feature/feature.component';
import { EventsComponent } from './type/events/events.component';
import { ReportsComponent } from './type/reports/reports.component';
import { AdminComponent } from './type/admin/admin.component';
import { DocumentationComponent } from './type/documentation/documentation.component';
import { SupportComponent } from './type/support/support.component';
import { ErrorRecentComponent } from './type/error/error-recent/error-recent.component';
import { ErrorFrequentComponent } from './type/error/error-frequent/error-frequent.component';
import { ErrorUsersComponent } from './type/error/error-users/error-users.component';
import { ErrorNewComponent } from './type/error/error-new/error-new.component';
import { LogDashboardComponent } from './type/log/log-dashboard/log-dashboard.component';
import { LogFrequentComponent } from './type/log/log-frequent/log-frequent.component';
import { LogNewComponent } from './type/log/log-new/log-new.component';
import { LogRecentComponent } from './type/log/log-recent/log-recent.component';
import { LogUsersComponent } from './type/log/log-users/log-users.component';
import { BrokenDashboardComponent } from './type/broken/broken-dashboard/broken-dashboard.component';
import { BrokenFrequentComponent } from './type/broken/broken-frequent/broken-frequent.component';
import { BrokenNewComponent } from './type/broken/broken-new/broken-new.component';
import { BrokenRecentComponent } from './type/broken/broken-recent/broken-recent.component';
import { BrokenUsersComponent } from './type/broken/broken-users/broken-users.component';
import { FeatureDashboardComponent } from './type/feature/feature-dashboard/feature-dashboard.component';
import { FeatureFrequentComponent } from './type/feature/feature-frequent/feature-frequent.component';
import { FeatureNewComponent } from './type/feature/feature-new/feature-new.component';
import { FeatureRecentComponent } from './type/feature/feature-recent/feature-recent.component';
import { FeatureUsersComponent } from './type/feature/feature-users/feature-users.component';
import { EventsDashboardComponent } from './type/events/events-dashboard/events-dashboard.component';
import { EventsFrequentComponent } from './type/events/events-frequent/events-frequent.component';
import { EventsNewComponent } from './type/events/events-new/events-new.component';
import { EventsRecentComponent } from './type/events/events-recent/events-recent.component';
import { EventsUsersComponent } from './type/events/events-users/events-users.component';
import { ProjectComponent } from './type/admin/project/project.component';
import { OrganizationComponent } from './type/admin/organization/organization.component';
import { AccountManageComponent } from './type/admin/account-manage/account-manage.component';
import { OpenDirective } from './directives/open.directive';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        SignupComponent,
        TypeComponent,
        ErrorComponent,
        HeaderComponent,
        SidebarComponent,
        SearchFilterComponent,
        ProjectFilterComponent,
        DateFilterComponent,
        ErrorDashboardComponent,
        LogComponent,
        BrokenComponent,
        FeatureComponent,
        EventsComponent,
        ReportsComponent,
        AdminComponent,
        DocumentationComponent,
        SupportComponent,
        ErrorRecentComponent,
        ErrorFrequentComponent,
        ErrorUsersComponent,
        ErrorNewComponent,
        LogDashboardComponent,
        LogFrequentComponent,
        LogNewComponent,
        LogRecentComponent,
        LogUsersComponent,
        BrokenDashboardComponent,
        BrokenFrequentComponent,
        BrokenNewComponent,
        BrokenRecentComponent,
        BrokenUsersComponent,
        FeatureDashboardComponent,
        FeatureFrequentComponent,
        FeatureNewComponent,
        FeatureRecentComponent,
        FeatureUsersComponent,
        EventsDashboardComponent,
        EventsFrequentComponent,
        EventsNewComponent,
        EventsRecentComponent,
        EventsUsersComponent,
        ProjectComponent,
        OrganizationComponent,
        AccountManageComponent,
        OpenDirective,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot(), // ToastrModule added
    ],
    providers: [BasicService, AuthService],
    bootstrap: [AppComponent]
})

export class AppModule {
}

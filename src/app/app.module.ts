import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2UiAuthModule } from 'ng2-ui-auth';
import { ToastrModule } from 'ngx-toastr';
import { LockerModule } from 'angular-safeguard';
import { HotkeyModule } from 'angular2-hotkeys';
import { NgxAnalyticsModule } from 'ngx-analytics';
import { NgxAnalyticsGoogleAnalytics } from 'ngx-analytics/ga';
import { ClipboardModule } from 'ngx-clipboard';
import 'd3';
import 'rickshaw';
import { RickshawModule } from 'ng2-rickshaw';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ChecklistModule } from 'angular-checklist';
import { GravatarModule } from 'ngx-gravatar';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IntercomModule } from 'ng-intercom';
import { NgxStripeModule } from 'ngx-stripe';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './components/auth/login/login.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { TokenInterceptor } from './service/token.interceptor';
import { AuthGuardService } from './service/auth-guard.service';
import { HeaderComponent } from './components/includes/header/header.component';
import { SidebarComponent } from './components/includes/sidebar/sidebar.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { ProjectFilterComponent } from './components/project-filter/project-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { ProjectComponent } from './components/layout/project/project.component';
import { OrganizationComponent } from './components/layout/organization/organization.component';
import { AccountManageComponent } from './components/account-manage/account-manage.component';
import { OpenDirective } from './directives/open.directive';
import { DashboardComponent } from './components/layout/dashboard/dashboard.component';
import { RecentComponent } from './components/layout/recent/recent.component';
import { UsersComponent } from './components/layout/users/users.component';
import { NewComponent } from './components/layout/new/new.component';
import { FrequentComponent } from './components/layout/frequent/frequent.component';
import { OrganizationNotificationComponent } from './components/organization-notification/organization-notification.component';
import { OrganizationService } from './service/organization.service';
import { FilterService } from './service/filter.service';
import { RickshawComponent } from './components/rickshaw/rickshaw.component';
import { ProjectListComponent } from './components/layout/project/project-list/project-list.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { ProjectNewComponent } from './components/layout/project/project-new/project-new.component';
import { OrganizationListComponent } from './components/layout/organization/organization-list/organization-list.component';
import { ProjectEditComponent } from './components/layout/project/project-edit/project-edit.component';
import { OrganizationEditComponent } from './components/layout/organization/organization-edit/organization-edit.component';
import { CustomDateRangeDialogComponent } from './dialogs/custom-date-range-dialog/custom-date-range-dialog.component';
import { SummaryComponent } from './components/summary/summary.component';
import { StacksComponent } from './components/stacks/stacks.component';
import { EventsComponent } from './components/events/events.component';
import { TimeagoComponent } from './components/timeago/timeago.component';
import { RelativeTimeComponent } from './components/relative-time/relative-time.component';
import { ActiveDirective } from './directives/active.directive';
import { StackComponent } from './components/layout/stack/stack.component';
import { AddReferenceDialogComponent } from './dialogs/add-reference-dialog/add-reference-dialog.component';
import { ChangePlanDialogComponent } from './dialogs/change-plan-dialog/change-plan-dialog.component';
import { ObjNgForPipe } from './pipes/obj-ng-for.pipe';
import { EventComponent } from './components/layout/event/event.component';
import { EventTabsComponent } from './components/layout/event/tabs/event-tabs/event-tabs.component';
import { DurationComponent } from './components/duration/duration.component';
import { StackTraceComponent } from './components/stack-trace/stack-trace.component';
import { SimpleStackTraceComponent } from './components/simple-stack-trace/simple-stack-trace.component';
import { ExtendedDataItemComponent } from './components/layout/event/extended-data-item/extended-data-item.component';
import { HasPropPipe } from './pipes/has-prop.pipe';
import { ProjectsComponent } from './components/projects/projects.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { UserComponent } from './components/user/user.component';
import { AddConfigurationDialogComponent } from './dialogs/add-configuration-dialog/add-configuration-dialog.component';
import { AddWebHookDialogComponent } from './dialogs/add-web-hook-dialog/add-web-hook-dialog.component';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { AddOrganizationDialogComponent } from './dialogs/add-organization-dialog/add-organization-dialog.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SessionsComponent } from './components/sessions/sessions.component';
import { SessionComponent } from './components/layout/session/session.component';
import { RateLimitComponent } from './components/rate-limit/rate-limit.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { LayoutComponent } from './components/layout/layout.component';
import { EmailUniqueValidatorDirective } from './validators/email-unique.validator';
import { OrganizationUniqueValidatorDirective } from './validators/organization-unique.validator';
import { ProjectUniqueValidatorDirective } from './validators/project-unique.validator';
import { SemanticVersionValidatorDirective } from './validators/semantic-version.validator';
import { ObjectDumpComponent } from './components/object-dump/object-dump.component';
import { ValueDumpComponent } from './components/value-dump/value-dump.component';
import { ArrayDumpComponent } from './components/array-dump/array-dump.component';
import { MarkFixedDialogComponent } from './dialogs/mark-fixed-dialog/mark-fixed-dialog.component';
import { SemverDirective } from './directives/semver.directive';
import { RefreshOnDirective } from './directives/refresh-on.directive';
import { ProjectConfigureComponent } from './components/layout/project/project-configure/project-configure.component';
import { AutoActiveDirective } from './directives/auto-active.directive';
import { StatusComponent } from './components/status/status.component';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

export const AuthConfig = {
    defaultHeaders: {'Content-Type': 'application/json'},
    providers: {
        google: { clientId: '' },
        facebook: { clientId: '' }
    },
    tokenName: 'token',
};

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        SignupComponent,
        HeaderComponent,
        SidebarComponent,
        SearchFilterComponent,
        ProjectFilterComponent,
        DateFilterComponent,
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
        OrganizationListComponent,
        ProjectEditComponent,
        OrganizationEditComponent,
        CustomDateRangeDialogComponent,
        SummaryComponent,
        TimeagoComponent,
        RelativeTimeComponent,
        ActiveDirective,
        StackComponent,
        AddReferenceDialogComponent,
        ChangePlanDialogComponent,
        ObjNgForPipe,
        EventComponent,
        EventTabsComponent,
        DurationComponent,
        StackTraceComponent,
        SimpleStackTraceComponent,
        ExtendedDataItemComponent,
        HasPropPipe,
        ProjectsComponent,
        InvoicesComponent,
        UserComponent,
        AddConfigurationDialogComponent,
        AddWebHookDialogComponent,
        AddUserDialogComponent,
        AddOrganizationDialogComponent,
        PaymentComponent,
        SessionsComponent,
        SessionComponent,
        RateLimitComponent,
        ResetPasswordComponent,
        LayoutComponent,
        EmailUniqueValidatorDirective,
        OrganizationUniqueValidatorDirective,
        ProjectUniqueValidatorDirective,
        SemanticVersionValidatorDirective,
        ObjectDumpComponent,
        ValueDumpComponent,
        ArrayDumpComponent,
        MarkFixedDialogComponent,
        SemverDirective,
        RefreshOnDirective,
        ProjectConfigureComponent,
        AutoActiveDirective,
        StatusComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right'
        }), // ToastrModule added
        LockerModule,
        RickshawModule,
        ModalDialogModule.forRoot(),
        NgbModule.forRoot(),
        Daterangepicker,
        ChecklistModule,
        Ng2UiAuthModule.forRoot(AuthConfig),
        HotkeyModule.forRoot(),
        NgxAnalyticsModule.forRoot([NgxAnalyticsGoogleAnalytics]),
        ClipboardModule,
        GravatarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        IntercomModule.forRoot({
            appId: environment.INTERCOM_APPID
        }),
        NgxStripeModule.forRoot(environment.STRIPE_PUBLISHABLE_KEY),
        LoadingBarRouterModule,
        LoadingBarHttpClientModule
    ],
    providers: [
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
    entryComponents: [
        ConfirmDialogComponent,
        CustomDateRangeDialogComponent,
        AddReferenceDialogComponent,
        AddOrganizationDialogComponent,
        MarkFixedDialogComponent,
        ChangePlanDialogComponent,
        AddUserDialogComponent,
        AddConfigurationDialogComponent,
        AddWebHookDialogComponent
    ]
})

export class AppModule {
}

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ErrorHandler } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from "@angular/common/http"; // TODO: We need to inspect our http interceptor implementation and ensure it only redirects on server error >=500 or no server response
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Ng2UiAuthModule } from "ng2-ui-auth";
import { ToastrModule } from "ngx-toastr";
import { LockerModule } from "angular-safeguard";
import { HotkeyModule } from "angular2-hotkeys";
import { Angulartics2Module } from "angulartics2";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { IntercomModule } from "ng-intercom";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { TokenInterceptor } from "./service/token.interceptor";
import { AuthGuardService } from "./service/auth-guard.service";
import { OrganizationService } from "./service/organization.service";
import { FilterService } from "./service/filter.service";
import { HasPropPipe } from "./pipes/has-prop.pipe";
import { StatusComponent } from "./components/status/status.component";
import { LoadingBarRouterModule } from "@ngx-loading-bar/router";
import { ModalDialogModule } from "ngx-modal-dialog";
import { Daterangepicker } from "ng2-daterangepicker";
import { NgxStripeModule } from "@nomadreservations/ngx-stripe";

import {ConfirmDialogComponent} from "./dialogs/confirm-dialog/confirm-dialog.component";
import {CustomDateRangeDialogComponent} from "./dialogs/custom-date-range-dialog/custom-date-range-dialog.component";
import {AddReferenceDialogComponent} from "./dialogs/add-reference-dialog/add-reference-dialog.component";
import {AddOrganizationDialogComponent} from "./dialogs/add-organization-dialog/add-organization-dialog.component";
import {MarkFixedDialogComponent} from "./dialogs/mark-fixed-dialog/mark-fixed-dialog.component";
import {ChangePlanDialogComponent} from "./dialogs/change-plan-dialog/change-plan-dialog.component";
import {AddUserDialogComponent} from "./dialogs/add-user-dialog/add-user-dialog.component";
import {AddConfigurationDialogComponent} from "./dialogs/add-configuration-dialog/add-configuration-dialog.component";
import {AddWebHookDialogComponent} from "./dialogs/add-web-hook-dialog/add-web-hook-dialog.component";
import {SemverDirective} from "./directives/semver.directive";
import {SemanticVersionValidatorDirective} from "./validators/semantic-version.validator";
import {ThousandSuffixPipe} from "./pipes/thousand-suffix.pipe";
import { ExceptionlessErrorHandler } from "./exceptionless-client";

export const AUTH_CONFIG = {
    defaultHeaders: {"Content-Type": "application/json"},
    providers: {
        google: { clientId: environment.GOOGLE_APPID },
        facebook: { clientId: environment.FACEBOOK_APPID },
        github: { clientId: environment.GITHUB_APPID },
        live: { clientId: environment.LIVE_APPID }
    },
    tokenName: "token",
};

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
    declarations: [
        AppComponent,
        HasPropPipe,
        StatusComponent,
        ConfirmDialogComponent,
        CustomDateRangeDialogComponent,
        AddReferenceDialogComponent,
        AddOrganizationDialogComponent,
        MarkFixedDialogComponent,
        ChangePlanDialogComponent,
        AddUserDialogComponent,
        AddConfigurationDialogComponent,
        AddWebHookDialogComponent,
        SemverDirective,
        SemanticVersionValidatorDirective,
        ThousandSuffixPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot({
            positionClass: "toast-bottom-right"
        }), // ToastrModule added
        LockerModule,
        Ng2UiAuthModule.forRoot(AUTH_CONFIG),
        HotkeyModule.forRoot(),
        Angulartics2Module.forRoot(),
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
        LoadingBarRouterModule,
        ModalDialogModule.forRoot(),
        Daterangepicker,
        NgxStripeModule.forRoot(environment.STRIPE_PUBLISHABLE_KEY)
    ],
    providers: [
        AuthGuardService,
        OrganizationService,
        FilterService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        ThousandSuffixPipe,
        {
          provide: ErrorHandler,
          useClass: ExceptionlessErrorHandler
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

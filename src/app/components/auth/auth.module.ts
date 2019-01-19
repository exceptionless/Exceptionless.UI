import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RateLimitComponent } from '../rate-limit/rate-limit.component';

import { HttpLoaderFactory } from '../../app.module';

import {EmailUniqueValidatorDirective} from '../../validators/email-unique.validator';
import {OrganizationUniqueValidatorDirective} from '../../validators/organization-unique.validator';


@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule.forRoot(),
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [
        LoginComponent,
        SignupComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        RateLimitComponent,
        EmailUniqueValidatorDirective,
        OrganizationUniqueValidatorDirective
    ]
})
export class AuthModule {}

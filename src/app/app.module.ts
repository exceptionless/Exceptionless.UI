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

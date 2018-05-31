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
import { HeaderComponent } from './type/includes/header/header.component';
import { SidebarComponent } from './type/includes/sidebar/sidebar.component';
import { SearchFilterComponent } from './type/includes/search-filter/search-filter.component';
import { ProjectFilterComponent } from './type/includes/project-filter/project-filter.component';
import { DateFilterComponent } from './type/includes/date-filter/date-filter.component';
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

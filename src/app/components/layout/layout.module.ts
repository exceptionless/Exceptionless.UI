import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { GravatarModule } from 'ngx-gravatar';
import { ChecklistModule } from 'angular-checklist';
import { CommonModule } from '@angular/common';

// containers
import {LayoutComponent} from './layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RecentComponent} from './recent/recent.component';
import {FrequentComponent} from './frequent/frequent.component';
import {UsersComponent} from './users/users.component';
import {NewComponent} from './new/new.component';
import {AccountManageComponent} from '../account-manage/account-manage.component';
import {StackComponent} from './stack/stack.component';
import {EventComponent} from './event/event.component';
import {SessionComponent} from './session/session.component';
import {AuthGuardService as AuthGuard} from '../../service/auth-guard.service';
import {HeaderComponent} from '../includes/header/header.component';
import {SidebarComponent} from '../includes/sidebar/sidebar.component';
import {SearchFilterComponent} from '../search-filter/search-filter.component';
import {ProjectFilterComponent} from '../project-filter/project-filter.component';
import {DateFilterComponent} from '../date-filter/date-filter.component';
import {EventsComponent} from '../events/events.component';
import {StacksComponent} from '../stacks/stacks.component';
import {SessionsComponent} from '../sessions/sessions.component';
import {EventTabsComponent} from './event/tabs/event-tabs/event-tabs.component';
import {ExtendedDataItemComponent} from './event/extended-data-item/extended-data-item.component';
import {ObjNgForPipe} from '../../pipes/obj-ng-for.pipe';
import {DurationComponent} from '../duration/duration.component';
import {AutoActiveDirective} from '../../directives/auto-active.directive';
import {SummaryComponent} from '../summary/summary.component';
import {RelativeTimeComponent} from '../relative-time/relative-time.component';
import {StackTraceComponent} from '../stack-trace/stack-trace.component';
import {SimpleStackTraceComponent} from '../simple-stack-trace/simple-stack-trace.component';
import {ValueDumpComponent} from '../value-dump/value-dump.component';
import {ArrayDumpComponent} from '../array-dump/array-dump.component';
import {ObjectDumpComponent} from '../object-dump/object-dump.component';
import {ActiveDirective} from '../../directives/active.directive';

import {TokenInterceptor} from '../../service/token.interceptor';

import {SharedModule} from '../../shared/shared.module';

// routes
export const ROUTES: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'type/:type/dashboard', component: DashboardComponent },
            { path: 'dashboard', component: DashboardComponent },
            { path: ':project_type/:id/:type/dashboard', component: DashboardComponent },
            { path: ':project_type/:id/dashboard', component: DashboardComponent },
            { path: 'type/:type/recent', component: RecentComponent },
            { path: 'recent', component: RecentComponent },
            { path: ':project_type/:id/:type/recent', component: RecentComponent },
            { path: ':project_type/:id/recent', component: RecentComponent },
            { path: 'type/:type/frequent', component: FrequentComponent },
            { path: 'frequent', component: FrequentComponent },
            { path: ':project_type/:id/:type/frequent', component: FrequentComponent },
            { path: ':project_type/:id/frequent', component: FrequentComponent },
            { path: 'type/:type/users', component: UsersComponent },
            { path: 'users', component: UsersComponent },
            { path: ':project_type/:id/:type/users', component: UsersComponent },
            { path: ':project_type/:id/users', component: UsersComponent },
            { path: 'type/:type/new', component: NewComponent },
            { path: 'new', component: NewComponent },
            { path: ':project_type/:id/:type/new', component: NewComponent },
            { path: ':project_type/:id/new', component: NewComponent },
            { path: 'project', loadChildren: './project/project.module#ProjectModule' },
            { path: 'organization', loadChildren: './organization/organization.module#OrganizationModule' },
            { path: 'account/manage', component: AccountManageComponent },
            { path: 'stack/:id', component: StackComponent },
            { path: 'event/:id', component: EventComponent },
            { path: 'session/dashboard', component: SessionComponent },
        ],
        canActivate: [AuthGuard],
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(ROUTES),
        CommonModule,
        HttpClientModule,
        GravatarModule,
        ChecklistModule,
        SharedModule
    ],
    declarations: [
        LayoutComponent,
        DashboardComponent,
        RecentComponent,
        FrequentComponent,
        UsersComponent,
        NewComponent,
        AccountManageComponent,
        StackComponent,
        EventComponent,
        SessionComponent,
        HeaderComponent,
        AutoActiveDirective,
        SidebarComponent,
        ProjectFilterComponent,
        SearchFilterComponent,
        DateFilterComponent,
        EventsComponent,
        StacksComponent,
        SessionsComponent,
        EventTabsComponent,
        ExtendedDataItemComponent,
        ObjNgForPipe,
        DurationComponent,
        SummaryComponent,
        RelativeTimeComponent,
        StackTraceComponent,
        SimpleStackTraceComponent,
        ObjectDumpComponent,
        ValueDumpComponent,
        ArrayDumpComponent,
        ActiveDirective,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    ]
})
export class LayoutModule {}

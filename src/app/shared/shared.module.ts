import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {HttpLoaderFactory} from '../app.module';
import {HttpClient} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardModule} from 'ngx-clipboard';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {RefreshOnDirective} from '../directives/refresh-on.directive';
import {ProjectUniqueValidatorDirective} from '../validators/project-unique.validator';
import {OrganizationNotificationComponent} from '../components/organization-notification/organization-notification.component';
import {TimeagoComponent} from '../components/timeago/timeago.component';
import {ApexchartComponent} from '../components/apexchart/apexchart.component';
import {ProjectsComponent} from '../components/projects/projects.component';
import {OpenDirective} from '../directives/open.directive';
import {UiScrollDirective} from '../directives/ui-scroll.directive';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbModule.forRoot(),
        ClipboardModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        RefreshOnDirective,
        ProjectUniqueValidatorDirective,
        OrganizationNotificationComponent,
        TimeagoComponent,
        ApexchartComponent,
        ProjectsComponent,
        OpenDirective,
        UiScrollDirective
    ],
    exports: [
        TranslateModule,
        RefreshOnDirective,
        NgbModule,
        ClipboardModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ProjectUniqueValidatorDirective,
        OrganizationNotificationComponent,
        TimeagoComponent,
        ApexchartComponent,
        ProjectsComponent,
        OpenDirective,
        UiScrollDirective
    ]
})
export class SharedModule {
}

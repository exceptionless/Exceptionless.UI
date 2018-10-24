import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from './login.class';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from '../../../service/notification.service';
import { WordTranslateService } from '../../../service/word-translate.service';
import { FilterService } from '../../../service/filter.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
    model = new Login();
    submitted = false;
    filterUrlPattern = '';
    projectId = '';
    projectType = '';
    constructor(
        private auth: AuthService,
        private notificationService: NotificationService,
        private router: Router,
        private filterService: FilterService,
        private wordTranslateService: WordTranslateService
    ) {
       if (this.auth.isAuthenticated()) {
           this.router.navigate(['/type/error/dashboard']);
       }
    }

    ngOnInit() {}

    onSubmit(isValid) {
        this.submitted = true;

        if (isValid) {
            const loginData = {
                email: this.model.email,
                password: this.model.password
            };

            this.auth.login(loginData).subscribe(
                res => {
                    if (this.filterService.getProjectType() === 'All Projects') {
                        this.filterUrlPattern = '';
                        this.router.navigate(['/type/error/dashboard']);
                    } else {
                        this.projectId = this.filterService.getProjectTypeId();
                        this.projectType = this.filterService.getProjectType();
                        if (!this.projectType) {
                            this.filterService.setProjectFilter('All Projects', '', 'All Projects');
                            this.filterService.setTime('all');
                            this.router.navigate(['/type/error/dashboard']);
                        } else {
                            this.filterUrlPattern = `${this.projectType}/${this.projectId}/`;
                            this.router.navigate([`${this.filterUrlPattern}/error/dashboard`]);
                        }
                    }
                },
                async err => {
                    this.notificationService.error('', await this.wordTranslateService.translate('Loggin_Failed_Message'));
                }
            );
        }
    }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Login } from './login.class';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from '../../../service/notification.service';
import { WordTranslateService } from '../../../service/word-translate.service';
import { FilterService } from '../../../service/filter.service';
// import { $ExceptionlessClient } from '../../../exceptionlessclient';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
    _source = 'app.auth.Login';
    model = new Login();
    submitted = false;
    filterUrlPattern = '';
    projectId = '';
    projectType = '';
    isEnableExtLogin: any;

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

    ngOnInit() {
        this.isEnableExtLogin = {
            total: this.isExternalLoginEnabled(),
            facebook: this.isExternalLoginEnabled('facebook'),
            github: this.isExternalLoginEnabled('github'),
            google: this.isExternalLoginEnabled('google'),
            live: this.isExternalLoginEnabled('live')
        };
    }

    isExternalLoginEnabled(provider = null) {
        if (!provider) {
            return !!environment.FACEBOOK_APPID || !!environment.GITHUB_APPID || !!environment.GOOGLE_APPID || !!environment.LIVE_APPID;
        }

        switch (provider) {
            case 'facebook':
                return !!environment.FACEBOOK_APPID;
            case 'github':
                return !!environment.GITHUB_APPID;
            case 'google':
                return !!environment.GOOGLE_APPID;
            case 'live':
                return !!environment.LIVE_APPID;
            default:
                return false;
        }
    }

    async getMessage(response) {
        let message = await this.wordTranslateService.translate('Loggin_Failed_Message');
        if (response.data && response.data.message)
            message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.data.message;

        return message;
    }

    async authenticate(provider) {
        const onSuccess = () => {
            // $ExceptionlessClient.createFeatureUsage('app.auth.Login.authenticate').addTags(provider).submit();
            return this.redirectOnLogin();
        };

        const onFailure = async (response) =>{
            // $ExceptionlessClient.createFeatureUsage('app.auth.Login.authenticate.error').setProperty('response', response).addTags(provider).submit();
            this.notificationService.error('', await this.getMessage(response));
        };

        return this.auth.authenticate(provider).toPromise().then(onSuccess, onFailure);
    }

    redirectOnLogin() {
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
    }

    async onSubmit(isValid) {
        this.submitted = true;

        if (isValid) {
            const loginData = {
                email: this.model.email,
                password: this.model.password
            };

            try {
                const res = await this.auth.login(loginData).toPromise();
                // $ExceptionlessClient.submitFeatureUsage(`${this._source}.login`);
                this.redirectOnLogin();
            } catch (err) {
                // $ExceptionlessClient.createFeatureUsage(`${this._source}.login.error`).setUserIdentity(this.model.email).submit();
                this.notificationService.error('', await this.wordTranslateService.translate('Loggin_Failed_Message'));
            }
        }
    }
}

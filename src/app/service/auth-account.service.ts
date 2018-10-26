import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'ng2-ui-auth';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs/Observable';
import { WordTranslateService } from './word-translate.service';

@Injectable({
    providedIn: 'root'
})

export class AuthAccountService {
    constructor(
        private router: Router,
        private authService: AuthService,
        private http: HttpClient,
        private notificationService: NotificationService,
        public wordTranslateService: WordTranslateService
    ) {}

    cancelResetPassword(resetToken) {
        const data = {};
        return this.http.post(`auth/cancel-reset-password/${resetToken}`,  data);
    }

    async changePassword(changePasswordModel) {
        const onSuccess = (response) => {
            this.authService.setToken(JSON.parse(JSON.stringify(response)));
            return response;
        };

        try {
            const res = await this.http.post(`auth/change-password`,  changePasswordModel).toPromise();
            onSuccess(res);
            return res;
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred'));
            return err;
        }
    }

    forgotPassword(email) {
        return this.http.get(`auth/forgot-password/${email}`);
    }

    getToken() {
        return this.authService.getToken();
    }

    isAuthenticated() {
        return this.authService.isAuthenticated();
    }

    isEmailAddressAvailable(email): Observable<HttpResponse<any>> {
        return this.http.get(`auth/check-email-address/${email}`, { observe: 'response' });
    }

    async logout(withRedirect?, params?) {
        const logoutLocally = () => {
            this.authService.logout()
                .subscribe({
                    error: (err: any) => this.notificationService.error('Error!', 'Error Occurred'),
                    complete: () => {
                        if (withRedirect) {
                            this.router.navigate([withRedirect], params);
                        } else {
                            this.router.navigate(['/login']);
                        }
                    }
                });
        };

        try {
            const res = await this.http.get('auth/logout/').toPromise();
            logoutLocally();
        } catch (err) {
            this.notificationService.error('Failed!', 'Error Occurred');
        }
    }

    resetPassword(resetPasswordModel) {
        return this.http.post('auth/reset-password',  resetPasswordModel);
    }

    async unlink(providerName, providerUserId) {
        const onSuccess = (response) => {
            this.authService.setToken(JSON.parse(JSON.stringify(response)));
            return response;
        };

        try {
            const res = await this.http.post(`auth/unlink/${providerName}`,  providerUserId).toPromise();
            onSuccess(res);
        } catch (err) {
            this.notificationService.error('Failed!', 'Error Occurred');
        }
    }
}

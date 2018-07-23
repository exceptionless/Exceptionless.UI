import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'ng2-ui-auth';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})
export class AuthAccountService {

    constructor(
        private router: Router,
        private authService: AuthService,
        private http: HttpClient,
        private notificationService: NotificationService
    ) {}

    cancelResetPassword(resetToken) {
        const data = {};
        return this.http.post(`auth/cancel-reset-password/${resetToken}`,  data);
    }

    changePassword(changePasswordModel) {
        const onSuccess = (response) => {
            this.authService.setToken(JSON.parse(JSON.stringify(response)));
            return response;
        };

        return new Promise((resolve, reject) => {
            this.http.post(`auth/change-password`,  changePasswordModel).subscribe(
                res => {
                    onSuccess(res);
                    resolve(res);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');
                    reject(err);
                }
            );
        });
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

    logout(withRedirect?, params?) {
        const logoutLocally = () => {
            this.authService.logout()
                .subscribe({
                    error: (err: any) => this.notificationService.error('Error Occurred!', 'Error'),
                    complete: () => {
                        if (withRedirect) {
                            this.router.navigate([withRedirect], params);
                        } else {
                            this.router.navigate(['/login']);
                        }
                    }
                });
        };

        return this.http.get('auth/logout/').subscribe(
            res => {
                logoutLocally();
            },
            err => {
                this.notificationService.error('Failed', 'Error Occurred!');
            }
        );
    }

    resetPassword(resetPasswordModel) {
        return this.http.post('auth/reset-password',  resetPasswordModel);
    }

    unlink(providerName, providerUserId) {
        const onSuccess = (response) => {
            this.authService.setToken(JSON.parse(JSON.stringify(response)));
            return response;
        };

        this.http.post(`auth/unlink/${providerName}`,  providerUserId).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                this.notificationService.error('Failed', 'Error Occurred!');
            }
        );
    }
}

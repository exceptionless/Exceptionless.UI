import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthAccountService } from '../../../service/auth-account.service';
import { NotificationService } from '../../../service/notification.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html'
})

export class ResetPasswordComponent implements OnInit {
    data = {
        password: '',
        confirm_password: '',
        password_reset_token: ''
    };
    _cancelResetToken = true;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authAccountService: AuthAccountService,
        private notificationService: NotificationService
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this.data.password_reset_token = params['tokenId'];
            this._cancelResetToken = params['cancel'];
        });
    }

    ngOnInit() {
        if (this._cancelResetToken) {
            this.cancelResetPassword();
        }
    }

    changePassword(isValid) {
        if (!isValid) {
            return;
        }

        const onSuccess = () => {
            this.notificationService.info('Success!', 'You have successfully changed your password.');
            return this.router.navigate(['/login']);
        };

        const onFailure = (response) => {
            let message = 'An error occurred while trying to change your password.';
            if (response && response.error) {
                message += ' ' + 'Message:' + ' ' + response.error;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.authAccountService.resetPassword(this.data).subscribe(
            res => {
                onSuccess();
            },
            err => {
                onFailure(err);
            }
        );
    }

    cancelResetPassword() {
        return this.authAccountService.cancelResetPassword(this.data.password_reset_token).subscribe(
            res => {
                this.router.navigate(['/login']);
            },
            err => {
                this.router.navigate(['/login']);
            }
        );
    }
}

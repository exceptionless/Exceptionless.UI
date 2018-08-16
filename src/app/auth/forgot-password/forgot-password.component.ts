import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { AuthAccountService } from '../../service/auth-account.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html'
})

export class ForgotPasswordComponent implements OnInit {
    emailAddress = '';

    constructor(
        private router: Router,
        private notificationService: NotificationService,
        private authAccountService: AuthAccountService,
    ) {}

    ngOnInit() {
    }

    resetPassword(isValid) {
        if (!isValid) {
            return;
        }

        const onSuccess = () => {
            this.notificationService.info('Success!', 'ResetPassword_Success_Message');
            return this.router.navigate(['/login']);
        };

        const onFailure = (response) => {
            let message = 'ResetPassword_Failed_Message';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.authAccountService.forgotPassword(this.emailAddress).subscribe(
            res => {
                onSuccess();
            },
            err => {
                onFailure(err);
            }
        );
    }
}

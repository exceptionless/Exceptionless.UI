import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../service/notification.service';
import { AuthAccountService } from '../../../service/auth-account.service';
import { WordTranslateService } from '../../../service/word-translate.service';

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
        private wordTranslateService: WordTranslateService
    ) {}

    ngOnInit() {
    }

    resetPassword(isValid) {
        if (!isValid) {
            return;
        }

        const onSuccess = async () => {
            this.notificationService.info('', await this.wordTranslateService.translate('ResetPassword_Success_Message'));
            return this.router.navigate(['/login']);
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('ResetPassword_Failed_Message');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
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

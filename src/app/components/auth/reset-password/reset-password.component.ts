import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthAccountService } from '../../../service/auth-account.service';
import { NotificationService } from '../../../service/notification.service';
import { WordTranslateService } from '../../../service/word-translate.service';

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
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService
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

        const onSuccess = async () => {
            this.notificationService.info('', await this.wordTranslateService.translate('You have successfully changed your password.'));
            return this.router.navigate(['/login']);
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while trying to change your password.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
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

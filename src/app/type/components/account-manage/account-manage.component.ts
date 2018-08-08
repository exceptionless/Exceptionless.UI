import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from '../../../service/notification.service';
import { AuthAccountService } from '../../../service/auth-account.service';
import { ProjectService } from '../../../service/project.service';
import { UserService } from '../../../service/user.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';
import { GlobalVariables } from '../../../global-variables';
import { EmailUniqueValidator } from '../../../validators/email-unique.validator';

@Component({
    selector: 'app-account-manage',
    templateUrl: './account-manage.component.html'
})

export class AccountManageComponent implements OnInit {
    @ViewChild('emailAddressForm') public emailAddressForm: NgForm;
    _canSaveEmailAddress = true;
    activeTab = 'general';
    password = {
        current_password: '',
        password: '',
        confirm_password: ''
    };
    emailNotificationSettings = {};
    currentProject = {};
    user = {};
    projects = [];
    projectId = '';
    hasPremiumFeatures = false;
    hasLocalAccount = false;
    emailUnique = true;
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private authAccountService: AuthAccountService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private userService: UserService,
        private modalDialogService: ModalDialogService,
        private viewRef: ViewContainerRef,
        private _globalVariables: GlobalVariables
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this.projectId = params['id'];
        });

        this.activatedRoute.queryParams.subscribe(params => {
            this.activeTab = params['tab'] || 'general';
        });
    }

    ngOnInit() {
        this.get();
    }

    filterProject(organizationName) {
        return this.projects.filter(function(p) { return p.organization_name === organizationName; });
    }

    authenticate(provider) {
        const onFailure = (response) => {
            let message = 'An error occurred while adding external login.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed', message);
        };

        return this.authService.authenticate(provider).subscribe(onFailure);
    }

    changePassword(isValid) {
        if (!isValid) {
            return;
        }

        const onSuccess = () => {
            this.notificationService.success('Success', 'You have successfully changed your password.');
            this.password = {
                current_password: '',
                password: '',
                confirm_password: ''
            };
            /*vm.passwordForm.$setUntouched(true);
            vm.passwordForm.$setPristine(true);*/
        };

        const onFailure = (response) => {
            let message = 'An error occurred while trying to change your password.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed', message);
        };

        return this.authAccountService.changePassword(this.password).then(
            res => {
                onSuccess();
            },
            err => {
                onFailure(err);
            }
        );
    }

    get(data?) {
        if (data && data.type === 'User' && data['deleted'] && data['id'] === this.user['id']) {
            this.notificationService.error('Failed', 'Your user account was deleted. Please create a new account.');
            return this.authService.logout();
        }

        return this.getUser().then(() => { this.getProjects().then(() => { this.getEmailNotificationSettings(); }); });
    }

    getEmailNotificationSettings() {
        const onSuccess = (response) => {
            this.emailNotificationSettings = JSON.parse(JSON.stringify(response));
            return this.emailNotificationSettings;
        };

        const onFailure = () => {
            this.notificationService.error('Failed', 'An error occurred while loading the notification settings.');
        };

        this.emailNotificationSettings = {};
        if (!this.currentProject['id']) {
            return;
        }

        return this.projectService.getNotificationSettings(this.currentProject['id'], this.user['id']).subscribe(
            res => {
                onSuccess(res);
            },
            err => {
                onFailure();
            }
        );
    }

    getProjects() {
        const onSuccess = (response) => {
            this.projects = JSON.parse(JSON.stringify(response));

            const currentProjectId = this.currentProject['id'] ? this.currentProject['id'] : this.projectId;
            this.currentProject = this.projects.filter(function(p) { return p.id === currentProjectId; })[0];
            if (!this.currentProject) {
                this.currentProject = this.projects.length > 0 ? this.projects[0] : {};
            }

            this.hasPremiumFeatures = this.currentProject && this.currentProject['has_premium_features'];
            return this.projects;
        };

        const onFailure = () => {
            this.notificationService.error('Failed', 'An error occurred while loading the projects.');
        };

        return new Promise((resolve, reject) => {
            this.projectService.getAll().subscribe(
                res => {
                    onSuccess(res.body);
                    resolve(res);
                },
                err => {
                    onFailure();
                    reject(err);
                }
            );
        });
    }

    getUser() {
        const onSuccess = (response) => {
            this.user = JSON.parse(JSON.stringify(response));
            this.user['o_auth_accounts'] = this.user['o_auth_accounts'] || [];
            this.hasLocalAccount = this.user['has_local_account'] === true;
            return this.user;
        };

        const onFailure = (response) => {
            let message = 'An error occurred while loading your user profile.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed', message);
        };

        return new Promise((resolve, reject) => {
            this.userService.getCurrentUser().subscribe(
                res => {
                    onSuccess(res);
                    resolve(res);
                },
                err => {
                    onFailure(err);
                    reject(err);
                }
            );
        });
    }

    deleteAccount() {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.userService.removeCurrentUser().subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully removed your user account.');
                        this.authAccountService.logout();
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying remove your user account.');
                        reject(err);
                    }
                );
            });
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'DIALOGS_CONFIRMATION',
            childComponent: ConfirmDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'DELETE ACCOUNT', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete your account?'
            }
        });
    }

    hasPremiumEmailNotifications() {
        return this.user['email_notifications_enabled'] && this.emailNotificationSettings && this.hasPremiumFeatures;
    }

    isExternalLoginEnabled(provider?) {
        if (!provider) {
            return !!this._globalVariables.FACEBOOK_APPID || !!this._globalVariables.GITHUB_APPID || !!this._globalVariables.GOOGLE_APPID || !!this._globalVariables.LIVE_APPID;
        }

        switch (provider) {
            case 'facebook':
                return !!this._globalVariables.FACEBOOK_APPID;
            case 'github':
                return !!this._globalVariables.GITHUB_APPID;
            case 'google':
                return !!this._globalVariables.GOOGLE_APPID;
            case 'live':
                return !!this._globalVariables.LIVE_APPID;
            default:
                return false;
        }
    }

    resendVerificationEmail() {
        const onFailure = (response) => {
            let message = 'An error occurred while sending your verification email.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.userService.resendVerificationEmail(this.user['id']).subscribe(
            res => {},
            err => {
                onFailure(err);
            }
        );
    }

    saveEmailAddress(isRetrying?) {
        this.authAccountService.isEmailAddressAvailable(this.user['email_address']).subscribe(
            res => {
                if (res['status'] === 201) {
                    this.emailUnique = false;
                } else {
                    this.emailUnique = true;
                }
            }
        );

        const resetCanSaveEmailAddress = () => {
            this._canSaveEmailAddress = true;
        };

        const retry = (delay?) => {
            setTimeout(() => { this.saveEmailAddress(true); }, delay || 100);
        };

        if (!this.emailAddressForm || this.emailAddressForm.valid) {
            resetCanSaveEmailAddress();
            return !isRetrying && retry(1000);
        }

        if (!this.user['email_address'] || this.emailAddressForm.pending) {
            return retry();
        }

        if (this._canSaveEmailAddress) {
            this._canSaveEmailAddress = false;
        } else {
            return;
        }

        const onSuccess = (response) => {
            this.user['is_email_address_verified'] = response.data['is_verified'];
        };

        const onFailure = (response) => {
            let message = 'An error occurred while saving your email address.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.userService.updateEmailAddress(this.user['id'], this.user['email_address']).subscribe(
            res => {
                onSuccess(res);
                resetCanSaveEmailAddress();
            },
            err => {
                onFailure(err);
            }
        );
    }

    saveEmailNotificationSettings() {
        const onFailure = (response) => {
            let message = 'An error occurred while saving your notification settings.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.projectService.setNotificationSettings(this.currentProject['id'], this.user['id'], this.emailNotificationSettings).subscribe(
            res => {},
            err => {
                onFailure(err);
            }
        );
    }

    saveEnableEmailNotification() {
        const onFailure = (response) => {
            let message = 'An error occurred while saving your email notification preferences.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.userService.update(this.user['id'], { email_notifications_enabled: this.user['email_notifications_enabled'] }).subscribe(
            res => {},
            err => {
                onFailure(err);
            }
        );
    }

    saveUser(isValid) {
        if (!isValid) {
            return;
        }

        const onFailure = (response) => {
            let message = 'An error occurred while saving your full name.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.userService.update(this.user['id'], this.user).subscribe(
            res => {},
            err => {
                onFailure(err);
            }
        );
    }

    showChangePlanDialog() {
        // need to implement later
    }

    unlink(account) {
        const onSuccess = () => {
            this.user['o_auth_accounts'].splice(this.user['o_auth_accounts'].indexOf(account), 1);
        };

        const onFailure = (response) => {
            let message = 'An error occurred while removing the external login.';
            if (response.data && response.data.message) {
                message += ' ' + 'Message:' + ' ' + response.data.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return this.authService.unlink(account['provider'], account['provider_user_id']).subscribe(
            res => {
                onSuccess();
            },
            err => {
                onFailure(err);
            }
        );
    }
}

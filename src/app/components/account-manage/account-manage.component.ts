import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from '../../service/notification.service';
import { AuthAccountService } from '../../service/auth-account.service';
import { ProjectService } from '../../service/project.service';
import { UserService } from '../../service/user.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { BillingService } from '../../service/billing.service';
import { DialogService } from '../../service/dialog.service';

@Component({
    selector: 'app-account-manage',
    templateUrl: './account-manage.component.html'
})

export class AccountManageComponent implements OnInit {
    @ViewChild('emailAddressForm') public emailAddressForm: NgForm;
    @ViewChild('passwordForm') public passwordForm: NgForm;
    _canSaveEmailAddress = true;
    activeTab = 'general';
    password = {
        current_password: '',
        password: '',
        confirm_password: ''
    };
    emailNotificationSettings = {};
    currentProject: any = {};
    user = {
        email_address: ''
    };
    projects = [];
    organizations = [];
    projectId = '';
    hasPremiumFeatures = false;
    hasLocalAccount = false;
    emailUnique = true;
    gravatarStyle = {
        'border-style': 'solid',
        'border-color': '#ddd'
    };

    submitted = false;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private authAccountService: AuthAccountService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private userService: UserService,
        private viewRef: ViewContainerRef,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private dialogService: DialogService
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.activeTab = params['tab'] || 'general';
            this.projectId = params['projectId'];
        });
    }

    ngOnInit() {
        this.get();
    }

    filterProject(organizationName) {
        return this.projects.filter(function(p) { return p.organization_name === organizationName; });
    }

    async authenticate(provider) {
        const onFailure = async (response) => {
            let message =  await this.wordTranslateService.translate('An error occurred while adding external login.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };
        try {
            const res = await this.authService.authenticate(provider).toPromise();
        } catch (err) {
            onFailure(err);
        }
    }

    async changePassword(isValid) {

        this.submitted = true;

        if (!isValid) {
            return;
        }

        const onSuccess = async () => {
            this.notificationService.success('', await this.wordTranslateService.translate('You have successfully changed your password.'));
            this.password = {
                current_password: '',
                password: '',
                confirm_password: ''
            };
            this.passwordForm.form.reset(true);
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while trying to change your password.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try  {
            await this.authAccountService.changePassword(this.password);
            onSuccess();
        } catch (err) {
            onFailure(err);
        }
    }

    async get(data?) {
        if (data && data.type === 'User' && data['deleted'] && data['id'] === this.user['id']) {
            this.notificationService.error('', await this.wordTranslateService.translate('Your user account was deleted. Please create a new account.'));
            return this.authService.logout();
        }

        try {
            await this.getUser();
            await this.getProjects();
            await this.getEmailNotificationSettings();
        } catch (err) {}
    }

    async getEmailNotificationSettings() {
        const onSuccess = (response) => {
            this.emailNotificationSettings = JSON.parse(JSON.stringify(response));
            return this.emailNotificationSettings;
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading the notification settings.'));
        };

        this.emailNotificationSettings = {};
        if (!this.currentProject['id']) {
            return;
        }

        try {
            const res = await this.projectService.getNotificationSettings(this.currentProject['id'], this.user['id']);
            onSuccess(res);
        } catch (err) {
            onFailure();
        }
    }

    async getProjects() {
        const onSuccess = (response) => {
            this.projects = JSON.parse(JSON.stringify(response));
            this.projects.forEach((project) => {
                if (this.organizations.findIndex(k => k === project['organization_name']) === -1) {
                    this.organizations.push(project['organization_name']);
                }
            });
            const currentProjectId = this.currentProject['id'] ? this.currentProject['id'] : this.projectId;
            this.currentProject = this.projects.filter(function(p) { return p.id === currentProjectId; })[0];
            if (!this.currentProject) {
                this.currentProject = this.projects.length > 0 ? this.projects[0] : {};
            }

            this.hasPremiumFeatures = this.currentProject && this.currentProject['has_premium_features'];
            return this.projects;
        };

        const onFailure = async () => {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while loading the projects.'));
        };

        try {
            const res = await this.projectService.getAll();
            onSuccess(res.body);
        } catch (err) {
            onFailure();
        }
    }

    async getUser() {
        const onSuccess = (response) => {
            this.user = JSON.parse(JSON.stringify(response));
            this.user['o_auth_accounts'] = this.user['o_auth_accounts'] || [];
            this.hasLocalAccount = this.user['has_local_account'] === true;
            return this.user;
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while loading your user profile.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            const res = await this.userService.getCurrentUser();
            onSuccess(res);
        } catch (err) {
            onFailure(err);
        }
    }

    async deleteAccount() {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.userService.removeCurrentUser();
                this.notificationService.success('', await this.wordTranslateService.translate('Successfully removed your user account.'));
                this.authAccountService.logout();
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying remove your user account.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to delete your account?', 'DELETE ACCOUNT', modalCallBackFunction);
    }

    hasPremiumEmailNotifications() {
        return this.user['email_notifications_enabled'] && this.emailNotificationSettings && this.hasPremiumFeatures;
    }

    isExternalLoginEnabled(provider?) {
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

    async resendVerificationEmail() {
        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while sending your verification email.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            await this.userService.resendVerificationEmail(this.user['id']);
        } catch (err) {
            onFailure(err);
        }
    }

    async saveEmailAddress(isRetrying?) {
        const resetCanSaveEmailAddress = () => {
            this._canSaveEmailAddress = true;
        };

        const retry = (delay?) => {
            setTimeout(() => { this.saveEmailAddress(true); }, delay || 100);
        };

        if (!this.emailAddressForm || this.emailAddressForm.form.valid) {
            resetCanSaveEmailAddress();
            /*return !isRetrying && retry(1000);*/
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
            this.user['is_email_address_verified'] = response['is_verified'];
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while saving your email address.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            const res = await this.userService.updateEmailAddress(this.user['id'], this.user['email_address']);
            onSuccess(res);
            resetCanSaveEmailAddress();
        } catch (err) {
            onFailure(err);
        }
    }

    async saveEmailNotificationSettings() {
        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while saving your notification settings.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            await this.projectService.setNotificationSettings(this.currentProject['id'], this.user['id'], this.emailNotificationSettings);
        } catch (err) {
            onFailure(err);
        }
    }

    async saveEnableEmailNotification() {
        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while saving your email notification preferences.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            await this.userService.update(this.user['id'], { email_notifications_enabled: this.user['email_notifications_enabled'] });
        } catch (err) {
            onFailure(err);
        }
    }

    async saveUser(isValid) {
        if (!isValid) {
            return;
        }

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while saving your full name.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            await this.userService.update(this.user['id'], this.user);
        } catch (err) {
            onFailure(err);
        }
    }

    showChangePlanDialog() {
        this.billingService.changePlan(this.viewRef, () => {}, this.currentProject ? this.currentProject.organization_id : null);
    }

    async unlink(account) {
        const onSuccess = () => {
            this.user['o_auth_accounts'].splice(this.user['o_auth_accounts'].indexOf(account), 1);
        };

        const onFailure = async (response) => {
            let message = await this.wordTranslateService.translate('An error occurred while removing the external login.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            await this.authService.unlink(account['provider'], account['provider_user_id']).toPromise();
            onSuccess();
        } catch (err) {
            onFailure(err);
        }
    }
}

import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'ng2-ui-auth';
import { NotificationService } from '../../../service/notification.service';
import { AuthAccountService } from '../../../service/auth-account.service';
import { ProjectService } from '../../../service/project.service';
import { UserService } from '../../../service/user.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';
import { GlobalVariables } from '../../../global-variables';

@Component({
    selector: 'app-account-manage',
    templateUrl: './account-manage.component.html',
    styleUrls: ['./account-manage.component.less']
})
export class AccountManageComponent implements OnInit {
    activeTabIndex = 0;
    password = {};
    emailNotificationSettings = {};
    currentProject = {};
    user = {};
    projects = [];
    projectId = '';
    hasPremiumFeatures = false;
    hasLocalAccount = false;
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
    }

    ngOnInit() {
        this.get();
    }

    filterProject(organizationName) {
        return this.projects.filter(function(p) { return p.organization_name === organizationName; });
    }

    activateTab(tabName) {
        switch (tabName) {
            case 'notifications':
                this.activeTabIndex = 1;
                break;
            case 'password':
                this.activeTabIndex = 2;
                break;
            case 'external':
                this.activeTabIndex = 3;
                break;
            default:
                this.activeTabIndex = 0;
                break;
        }
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
            this.password = {};
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

    isExternalLoginEnabled(provider) {
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
}

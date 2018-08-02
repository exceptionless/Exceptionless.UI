import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { ModalDialogService } from 'ngx-modal-dialog';
import { LinkService } from '../../../service/link.service';
import { NotificationService } from '../../../service/notification.service';
import { OrganizationService } from '../../../service/organization.service';
import { PaginationService } from '../../../service/pagination.service';
import { UserService } from '../../../service/user.service';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.less']
})
export class UserComponent implements OnInit {
    @Input() settings;
    users = [];
    next: string;
    previous: string;
    pageSummary: string;
    currentOptions = {};
    loading = true;
    constructor(
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private linkService: LinkService,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private paginationService: PaginationService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.get();
    }

    get(options?) {
        const onSuccess = (response, link) => {
            this.users = JSON.parse(JSON.stringify(response));
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response.data, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.users.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.users;
        };

        this.currentOptions = options || this.settings.options;

        return new Promise((resolve, reject) => {
            this.settings.get(this.currentOptions).subscribe(
                res => {
                    onSuccess(res.body, res.headers.get('link'));
                    this.loading = false;
                    resolve(this.users);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');
                    reject(err);
                }
            );
        });
    }

    hasAdminRole(user) {
        return this.userService.hasAdminRole(user);
    }

    hasUsers() {
        return this.users && this.users.length > 0;
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }

    remove(user) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.organizationService.removeUser(this.settings['organizationId'], user['email_address']).subscribe(
                    res => {
                        this.users.splice(this.users.indexOf(user), 1);
                        this.notificationService.success('Success!', 'Successfully queued the user for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to remove the user.');
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
                { text: 'Remove User', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to remove this user from your organization?'
            }
        });
    }

    resendNotification(user) {
        return this.organizationService.addUser(this.settings['organizationId'], user['email_address']).subscribe(
            res => {
                this.notificationService.success('Success', 'Successfully queued!');
            },
            err => {
                this.notificationService.error('Failed!', 'An error occurred while trying to resend the notification.');
            }
        );
    }

    updateAdminRole(user) {
        const message = !this.userService.hasAdminRole(user) ? 'Are you sure you want to add the admin role for this user?' : 'Are you sure you want to remove the admin role from this user?';
        const btnTxt = !this.userService.hasAdminRole(user) ? 'Add' : 'Remove';
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                if (!this.userService.hasAdminRole(user)) {
                    return this.userService.addAdminRole(user['id']).subscribe(
                        res => {
                            this.notificationService.success('Success!', 'Successfully queued the user for change role.');
                            resolve(res);
                        },
                        err => {
                            this.notificationService.error('Failed!', 'An error occurred while trying to chage user role.');
                            reject(err);
                        }
                    );
                }

                this.userService.removeAdminRole(user['id']).subscribe(
                    res => {
                        this.notificationService.success('Success!', 'Successfully queued the user for change role.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to remove the user.');
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
                { text: btnTxt, buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: message
            }
        });
    }
}

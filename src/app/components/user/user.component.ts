import { Component, OnInit, Input, ViewContainerRef, HostBinding } from '@angular/core';
import { LinkService } from '../../service/link.service';
import { NotificationService } from '../../service/notification.service';
import { OrganizationService } from '../../service/organization.service';
import { PaginationService } from '../../service/pagination.service';
import { UserService } from '../../service/user.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { DialogService } from '../../service/dialog.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html'
})

export class UserComponent implements OnInit {
    @HostBinding('class.app-component') appComponent = true;
    @Input() settings;
    users = [];
    next: string;
    previous: string;
    pageSummary: string;
    currentOptions = {};
    loading = true;
    constructor(
        private viewRef: ViewContainerRef,
        private linkService: LinkService,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private paginationService: PaginationService,
        private userService: UserService,
        private wordTranslateService: WordTranslateService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.get();
    }

    async get(options?) {
        const onSuccess = (response, link) => {
            this.users = JSON.parse(JSON.stringify(response));
            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.users.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.users;
        };

        this.currentOptions = options || this.settings.options;

        try {
            const res = await this.settings.get(this.currentOptions).toPromise();
            onSuccess(res.body, res.headers.get('link'));
            this.loading = false;
            return this.users;
        } catch (err) {
            this.loading = false;
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred!'));
            return err;
        }
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

    async remove(user) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.organizationService.removeUser(this.settings['organizationId'], user['email_address']);
                this.users.splice(this.users.indexOf(user), 1);
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to remove the user.'));
                return err;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, 'Are you sure you want to remove this user from your organization?', 'Remove User', modalCallBackFunction);
    }

    async resendNotification(user) {
        try {
            await this.organizationService.addUser(this.settings['organizationId'], user['email_address']);
        } catch (err) {
            this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to resend the notification.'));
        }
    }

    async updateAdminRole(user) {
        const message = !this.userService.hasAdminRole(user) ? 'Are you sure you want to add the admin role for this user?' : 'Are you sure you want to remove the admin role from this user?';
        const btnTxt = await this.wordTranslateService.translate(!this.userService.hasAdminRole(user) ? 'Add' : 'Remove');
        const modalCallBackFunction = async () => {
            if (!this.userService.hasAdminRole(user)) {
                try {
                    const res = await this.userService.addAdminRole(user['id']);
                    this.notificationService.success('', await this.wordTranslateService.translate('Successfully queued the user for change role.'));
                    return res;
                } catch (err) {
                    this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to chage user role.'));
                    return err;
                }
            }

            try {
                const res = await this.userService.removeAdminRole(user['id']);
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to remove the user.'));
                return err;
            }
        };
        this.dialogService.confirm(this.viewRef, message, btnTxt, modalCallBackFunction);
    }
}

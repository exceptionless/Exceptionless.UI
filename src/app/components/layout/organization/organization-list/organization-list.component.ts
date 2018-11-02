import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { LinkService } from '../../../../service/link.service';
import { PaginationService } from '../../../../service/pagination.service';
import { NotificationService } from '../../../../service/notification.service';
import { OrganizationService } from '../../../../service/organization.service';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { UserService } from '../../../../service/user.service';
import { DialogService } from '../../../../service/dialog.service';
import { AppEventService } from '../../../../service/app-event.service';
import { BillingService } from '../../../../service/billing.service';

@Component({
    selector: 'app-organization-list',
    templateUrl: './organization-list.component.html'
})

export class OrganizationListComponent implements OnInit {
    _settings = { mode: 'stats' };
    canChangePlan = false;
    loading = true;
    next: string;
    previous: string;
    currentOptions = {};
    organizations = [];
    pageSummary: string;
    authUser: any = {};

    constructor(
        private router: Router,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private notificationService: NotificationService,
        private viewRef: ViewContainerRef,
        private organizationService: OrganizationService,
        private wordTranslateService: WordTranslateService,
        private userService: UserService,
        private dialogService: DialogService,
        private appEvent: AppEventService,
        private billingService: BillingService
    ) {}

    ngOnInit() {
        this.authUser = this.userService.authUser;
        this.appEvent.subscribe({
            next: (event: any) => {
                if (event.type === 'UPDATE_USER') {
                    this.authUser = this.userService.authUser;
                }
            }
        });
        this.get();
    }

    add() {
        const modalCallBackFunction = (name) => {
            this.createOrganization(name);
            return true;
        };

        this.dialogService.addOrganization(this.viewRef, modalCallBackFunction.bind(this));
    }

    async changePlan(organizationId) {
        if (!environment.STRIPE_PUBLISHABLE_KEY) {
            this.notificationService.error('', await this.wordTranslateService.translate('Billing is currently disabled.'));
            return;
        }

        return this.billingService.changePlan(this.viewRef, () => {}, organizationId);
    }

    async createOrganization(name) {
        const onSuccess = (response) => {
            this.organizations.push(JSON.parse(JSON.stringify(response)));
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
        };

        const onFailure = async (response) => {
            if (response.status === 426) {
                // need to implement later(billing service)
            }

            let message = await this.wordTranslateService.translate('An error occurred while creating the organization.');
            if (response && response.error.message) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error.message;
            }

            this.notificationService.error('', message);
        };

        try {
            const res = await this.organizationService.create(name);
            onSuccess(res);
            return res;
        } catch (err) {
            onFailure(err);
            return err;
        }
    }

    async get(options?) {
        const onSuccess = (response, link) => {
            this.organizations = JSON.parse(JSON.stringify(response));
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;

            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.organizations.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.organizations;
        };

        this.loading = this.organizations.length === 0;
        this.currentOptions = options || this._settings;

        try {
            const res = await this.organizationService.getAll(this.currentOptions);
            onSuccess(res['body'], res['headers'].get('link'));
            this.loading = false;
            return this.organizations;
        } catch (err) {
            this.loading = false;
            this.notificationService.error('', await this.wordTranslateService.translate('Error Occurred!'));
            return err;
        }
    }

    async leave(organization, user) {
        const modalCallBackFunction = async () => {
            const onSuccess = () => {
                this.organizations.splice(this.organizations.indexOf(organization), 1);
                this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
            };

            const onFailure = (response) => {
                let message: any = this.wordTranslateService.translate('An error occurred while trying to leave the organization.');
                if (response.status === 400) {
                    message += ' ' + this.wordTranslateService.translate('Message:') + ' ' + response.error.message;
                }

                this.notificationService.error('', message);
            };

            try {
                await this.organizationService.removeUser(organization.id, user.email_address);
                onSuccess();
            } catch (err) {
                onFailure(err);
            }
        };

        this.dialogService.confirm(this.viewRef, 'Are you sure you want to leave this organization?', 'Leave Organization', modalCallBackFunction.bind(this));
    }

    open(id, event) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/organization/${id}/manage`, '_blank');
        } else {
            this.router.navigate([`/organization/${id}/manage`]);
        }

        event.preventDefault();
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }

    async remove(organization) {
        const modalCallBackFunction = async () => {
            try {
                const res = await this.organizationService.remove(organization['id']);
                this.organizations.splice(this.organizations.indexOf(organization), 1);
                this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
                this.notificationService.success('', await this.wordTranslateService.translate('Successfully queued the organization for deletion.'));
                return res;
            } catch (err) {
                this.notificationService.error('', await this.wordTranslateService.translate('An error occurred while trying to delete the organization.'));
                return err;
            }
        };

        this.dialogService.confirm(this.viewRef, 'Are you sure you want to delete this organization?', 'Delete Project', modalCallBackFunction.bind(this));
    }
}

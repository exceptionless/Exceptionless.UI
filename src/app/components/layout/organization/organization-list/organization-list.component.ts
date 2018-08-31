import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalVariables } from '../../../../global-variables';
import { LinkService } from '../../../../service/link.service';
import { PaginationService } from '../../../../service/pagination.service';
import { NotificationService } from '../../../../service/notification.service';
import { ModalDialogService } from 'ngx-modal-dialog';
import { ConfirmDialogComponent } from '../../../../dialogs/confirm-dialog/confirm-dialog.component';
import { AddOrganizationDialogComponent } from '../../../../dialogs/add-organization-dialog/add-organization-dialog.component';
import { OrganizationService } from '../../../../service/organization.service';
import { ModalParameterService } from '../../../../service/modal-parameter.service';

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
    constructor(
        private _global: GlobalVariables,
        private router: Router,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private notificationService: NotificationService,
        private viewRef: ViewContainerRef,
        private modalDialogService: ModalDialogService,
        private organizationService: OrganizationService,
        private modalParameterService: ModalParameterService,
    ) {}

    ngOnInit() {
        this.get();
    }

    add() {
        const modalCallBackFunction = () => {
            const name = this.modalParameterService.getModalParameter('organizationName');
            this.createOrganization(name);
            return true;
        };

        this.modalDialogService.openDialog(this.viewRef, {
            title: 'New Organization',
            childComponent: AddOrganizationDialogComponent,
            actionButtons: [
                { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
                { text: 'Save', buttonClass: 'btn btn-primary', onAction: () => modalCallBackFunction() }
            ],
            data: {
                key: 'organizationName'
            }
        });
    }

    changePlan(organizationId) {
        if (!this._global.STRIPE_PUBLISHABLE_KEY) {
            this.notificationService.error('Failed!', 'Billing is currently disabled.');
            return;
        }

        // need to implement later(billing service)
    }

    createOrganization(name) {
        const onSuccess = (response) => {
            this.organizations.push(JSON.parse(JSON.stringify(response)));
            this.canChangePlan = !!this._global.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
        };

        const onFailure = (response) => {
            if (response.status === 426) {
                // need to implement later(billing service)
                console.log(response.error.message);
            }

            let message = 'An error occurred while creating the organization.';
            if (response && response.error.message) {
                message += ' ' + 'Message:' + ' ' + response.error.message;
            }

            this.notificationService.error('Failed!', message);
        };

        return new Promise((resolve, reject) => {
            this.organizationService.create(name).subscribe(
                res => {
                    onSuccess(res.body);
                    resolve(res);
                },
                err => {
                    onFailure(err);
                    reject(err);
                }
            );
        });
    }

    get(options?) {
        const onSuccess = (response, link) => {
            this.organizations = JSON.parse(JSON.stringify(response));
            this.canChangePlan = !!this._global.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;

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

        return new Promise((resolve, reject) => {
            this.organizationService.getAll(this.currentOptions).subscribe(
                res => {
                    onSuccess(res.body, res.headers.get('link'));
                    this.loading = false;
                    resolve(this.organizations);
                },
                err => {
                    this.loading = false;
                    this.notificationService.error('Failed', 'Error Occurred!');
                    reject(err);
                }
            );
        });
    }

    leave(organization, user) {
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

    remove(organization) {
        const modalCallBackFunction = () => {
            return new Promise((resolve, reject) => {
                this.organizationService.remove(organization['id']).subscribe(
                    res => {
                        this.organizations.splice(this.organizations.indexOf(organization), 1);
                        this.canChangePlan = !!this._global.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
                        this.notificationService.success('Success!', 'Successfully queued the organization for deletion.');
                        resolve(res);
                    },
                    err => {
                        this.notificationService.error('Failed!', 'An error occurred while trying to delete the organization.');
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
                { text: 'Delete Project', buttonClass: 'btn btn-primary btn-dialog-confirm btn-danger', onAction: () => modalCallBackFunction() }
            ],
            data: {
                text: 'Are you sure you want to delete this organization?'
            }
        });
    }
}

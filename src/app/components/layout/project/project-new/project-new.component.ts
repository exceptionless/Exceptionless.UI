import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NotificationService } from '../../../../service/notification.service';
import { OrganizationService } from '../../../../service/organization.service';
import { ProjectService } from '../../../../service/project.service';
import { WordTranslateService } from '../../../../service/word-translate.service';
import { BillingService } from '../../../../service/billing.service';

@Component({
    selector: 'app-project-new',
    templateUrl: './project-new.component.html'
})

export class ProjectNewComponent implements OnInit {
    @ViewChild('addForm') public addForm: NgForm;
    _canAdd = true;
    _newOrganizationId = '__newOrganization';
    currentOrganization = {};
    organizations = [];
    organization_name = '';
    project_name = '';
    organizationId = '';
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private viewRef: ViewContainerRef
    ) {
        this.activatedRoute.params.subscribe( (params) => {
            this.organizationId = params['id'];
        });
    }

    ngOnInit() {
        this.getOrganizations();
    }

    add(isRetrying?) {
        const resetCanAdd = () => {
            this._canAdd = true;
        };

        const retry = (delay?) => {
            setTimeout(() => { this.add(true); }, delay || 100);
        };

        if (!this.addForm || this.addForm.invalid) {
            resetCanAdd();
            /*return !isRetrying && retry(1000);*/
        }

        if ((this.canCreateOrganization() && !this.organization_name) || !this.project_name || this.addForm.pending) {
            return retry();
        }

        if (this._canAdd) {
            this._canAdd = false;
        } else {
            return;
        }

        if (this.canCreateOrganization()) {
            return this.createOrganization(this.organization_name).then(() => { this.createProject().then(() => { resetCanAdd(); }); });
        }

        return this.createProject(this.currentOrganization).then(() => { resetCanAdd(); });
    }

    canCreateOrganization() {
        return this.currentOrganization['id'] === this._newOrganizationId || !this.hasOrganizations();
    }

    async createOrganization(name) {
        const onSuccess = (response) => {
            this.organizations.push(JSON.parse(JSON.stringify(response)));
            this.currentOrganization = JSON.parse(JSON.stringify(response));
            return response;
        };

        const onFailure = async (response) => {
            if (response.status === 426) {
                // need to implement later Exceptionless
            }

            let message = await this.wordTranslateService.translate('An error occurred while creating the organization.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error;
            }

            this.notificationService.error('', message);
        };

        try {
            const res = await this.organizationService.create(name).toPromise();
            onSuccess(res);
            return res;
        } catch (err) {
            onFailure(err);
            return err;
        }
    }

    async createProject(organization?) {
        if (!organization) {
            this._canAdd = true;
            return;
        }

        const onSuccess = (response) => {
            this.router.navigate([`/project/${response['id']}/configure`], { queryParams: { redirect: true } });
        };

        const onFailure = async (response) => {
            if (response.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, response.error.message, organization.id, () => {
                    return this.createProject(organization);
                });
            }

            let message = await this.wordTranslateService.translate('An error occurred while creating the project.');
            if (response && response.error) {
                message += ' ' + await this.wordTranslateService.translate('Message:') + ' ' + response.error.message;
            }

            this.notificationService.error('', message);
        };

        try {
            const res = await this.projectService.create(organization.id, this.project_name).toPromise();
            onSuccess(res);
            return res;
        } catch (err) {
            onFailure(err);
            return err;
        }
    }

    getOrganizations() {
        const onSuccess = (response) => {
            this.organizations = JSON.parse(JSON.stringify(response));
            this.organizations.push({id: this._newOrganizationId, name: '<New Organization>'});

            const currentOrganizationId = this.currentOrganization['id'] ? this.currentOrganization['id'] : this.organizationId;
            this.currentOrganization = this.organizations.filter(function(o) { return o.id === currentOrganizationId; })[0];
            if (!this.currentOrganization) {
                this.currentOrganization = this.organizations.length > 0 ? this.organizations[0] : {};
            }
        };
        return this.organizationService.getAll().subscribe(
            res => {
                onSuccess(res.body);
            },
            err => {
                if (!this.notificationService) {
                    this.notificationService.error('', 'Error occurred while get organizations');
                }
            }
        );
    }

    hasOrganizations() {
        return this.organizations.filter((o) => {
            return o.id !== this._newOrganizationId;
        }).length > 0;
    }
}

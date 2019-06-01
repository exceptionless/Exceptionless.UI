import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { NotificationService } from "../../../../service/notification.service";
import { OrganizationService } from "../../../../service/organization.service";
import { ProjectService } from "../../../../service/project.service";
import { WordTranslateService } from "../../../../service/word-translate.service";
import { BillingService } from "../../../../service/billing.service";
import { Organization } from "src/app/models/organization";
import { Subscription } from "rxjs";

@Component({
    selector: "app-project-new",
    templateUrl: "./project-new.component.html"
})

export class ProjectNewComponent implements OnInit, OnDestroy {
    private _canAdd: boolean = true;
    private _newOrganizationId: string = "__newOrganization";
    public currentOrganization: Organization;
    public organizations: Organization[];
    public organizationName: string;
    public projectName: string;
    public organizationId: string;
    public submitted: boolean = false;
    private subscriptions: Subscription[];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private notificationService: NotificationService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private viewRef: ViewContainerRef
    ) {}

    public async ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            this.organizationId = params.id;
        }));

        await this.getOrganizations();
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public async add(form: NgForm, isRetrying?: boolean) {
        this.submitted = true; // TODO: Can this be simplified? It seems overly complex.

        const resetCanAdd = () => {
            this._canAdd = true;
        };

        const retry = (delay?) => {
            setTimeout(() => { this.add(form, true); }, delay || 100);
        };

        if (!form || form.invalid) {
            resetCanAdd();
            /*return !isRetrying && retry(1000);*/
        }

        if ((this.canCreateOrganization() && !this.organizationName) || !this.projectName || form.pending) {
            return retry();
        }

        if (this._canAdd) {
            this._canAdd = false;
        } else {
            return;
        }

        if (this.canCreateOrganization()) {
            try {
                await this.createOrganization(this.organizationName);
                await this.createProject();
                await resetCanAdd();
            } catch (ex) {}
        }

        try {
            await this.createProject(this.currentOrganization);
            await resetCanAdd();
        } catch (ex) {}
    }

    public canCreateOrganization(): boolean {
        return this.currentOrganization.id === this._newOrganizationId || !this.hasOrganizations();
    }

    private async createOrganization(name: string) {
        try {
            const organization = await this.organizationService.create(name);
            this.organizations.push(organization);
            this.currentOrganization = organization;
        } catch (ex) {
            if (ex.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, ex.error.message, null, () => {
                    this.createOrganization(name);
                });
            }

            let message = await this.wordTranslateService.translate("An error occurred while creating the organization.");
            if (ex.error) {
                message += " " + await this.wordTranslateService.translate("Message:") + " " + ex.error.message;
            } // TODO: Find for usages of message translation and ensure we are resolving the error message correctly.

            this.notificationService.error("", message);
        }
    }

    private async createProject(organization?: Organization) {
        if (!organization) {
            this._canAdd = true;
            return;
        }

        try {
            const project = await this.projectService.create(organization.id, this.projectName);
            await this.router.navigate([`/project/${project.id}/configure`], { queryParams: { redirect: true } });
        } catch (ex) {
            if (ex.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, ex.error.message, organization.id, async () => {
                    await this.createProject(organization);
                });
            }

            let message = await this.wordTranslateService.translate("An error occurred while creating the project.");
            if (ex.error) {
                message += " " + await this.wordTranslateService.translate("Message:") + " " + ex.error.message;
            }

            this.notificationService.error("", message);
        }
    }

    public async getOrganizations() {
        try {
            this.organizations = await this.organizationService.getAll();
            this.organizations.push({id: this._newOrganizationId, name: "<New Organization>"} as Organization);

            const currentOrganizationId = this.currentOrganization.id ? this.currentOrganization.id : this.organizationId;
            this.currentOrganization = this.organizations.filter(o => o.id === currentOrganizationId)[0];
            if (!this.currentOrganization) {
                this.currentOrganization = this.organizations.length > 0 ? this.organizations[0] : {} as Organization;
            }
        } catch (ex) {
            if (!this.notificationService) {
                this.notificationService.error("", "Error occurred while get organizations");
            }
        }
    }

    public hasOrganizations(): boolean {
        return this.organizations.filter((o) => {
            return o.id !== this._newOrganizationId;
        }).length > 0;
    }
}

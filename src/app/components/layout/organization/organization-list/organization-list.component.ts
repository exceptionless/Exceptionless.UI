import { Component, OnInit, ViewContainerRef, OnDestroy } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { LinkService } from "../../../../service/link.service";
import { PaginationService } from "../../../../service/pagination.service";
import { NotificationService } from "../../../../service/notification.service";
import { OrganizationService } from "../../../../service/organization.service";
import { WordTranslateService } from "../../../../service/word-translate.service";
import { UserService } from "../../../../service/user.service";
import { DialogService } from "../../../../service/dialog.service";
import { AppEventService } from "../../../../service/app-event.service";
import { BillingService } from "../../../../service/billing.service";
import { Subscription } from "rxjs";
import { Organization } from "src/app/models/organization";
import { CurrentUser, User } from "src/app/models/user";
import { TypedMessage } from "src/app/models/messaging";

@Component({
    selector: "app-organization-list",
    templateUrl: "./organization-list.component.html"
})
export class OrganizationListComponent implements OnInit, OnDestroy {
    private _settings: any  = { mode: "stats" };
    public canChangePlan: boolean = false;
    public loading: boolean = true;
    public next: any;
    public previous: any;
    public currentOptions: any = {};
    public organizations: Organization[];
    public pageSummary: string;
    public user: CurrentUser;
    private subscriptions: Subscription[];

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

    public async ngOnInit() {
        this.subscriptions = [];
        this.user = await this.userService.getCurrentUser();
        this.subscriptions.push(this.appEvent.subscribe({
            next: async (event: TypedMessage) => {
                if (event.type === "UPDATE_USER") {
                    this.user = await this.userService.getCurrentUser(); // TODO: Do we need to store this in the service?
                }
            }
        }));

        await this.get();
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public async add() {
        const modalCallBackFunction = (name: string) => {
            this.createOrganization(name);
            return true;
        };

        await this.dialogService.addOrganization(this.viewRef, modalCallBackFunction.bind(this));
    }

    public async changePlan(organizationId: string) {
        if (!environment.STRIPE_PUBLISHABLE_KEY) {
            this.notificationService.error("", await this.wordTranslateService.translate("Billing is currently disabled."));
            return;
        }

        await this.billingService.changePlan(this.viewRef, () => {}, organizationId);
    }

    private async createOrganization(name: string) {
        try {
            const organization = await this.organizationService.create(name);
            this.organizations.push(organization);
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
        } catch (ex) {
            if (ex.status === 426) {
                // TODO: need to implement later(billing service)
            }

            let message = await this.wordTranslateService.translate("An error occurred while creating the organization.");
            if (ex.error && ex.error.message) {
                message += " " + await this.wordTranslateService.translate("Message:") + " " + ex.error.message;
            }

            this.notificationService.error("", message);
        }
    }

    private async get(options?) {
        this.loading = this.organizations.length === 0;
        this.currentOptions = options || this._settings;

        try {
            // this.organizations = await this.organizationService.getAll(this.currentOptions);

            const response: any = await this.organizationService.getAll(this.currentOptions);
            this.organizations = response.data;

            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;

            const links = this.linkService.getLinksQueryParameters(response.headers.get("link"));
            this.previous = links.previous;
            this.next = links.next;

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions.page, this.currentOptions.limit);

            if (this.organizations.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.loading = false;
        }
    }

    public async leave(organization: Organization, user: User) {
        const modalCallBackFunction = async () => {
            try {
                await this.organizationService.removeUser(organization.id, user.email_address);
                this.organizations.splice(this.organizations.indexOf(organization), 1);
                this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
            } catch (ex) {
                let message: any = this.wordTranslateService.translate("An error occurred while trying to leave the organization.");
                if (ex.status === 400) {
                    message += " " + this.wordTranslateService.translate("Message:") + " " + ex.error.message;
                }

                this.notificationService.error("", message);
            }
        };

        this.dialogService.confirm(this.viewRef, "Are you sure you want to leave this organization?", "Leave Organization", modalCallBackFunction.bind(this));
    }

    public open(id: string, event: MouseEvent) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/organization/${id}/manage`, "_blank");
        } else {
            this.router.navigate([`/organization/${id}/manage`]);
        }

        event.preventDefault();
    }

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }

    public async remove(organization) {
        const modalCallBackFunction = async () => {
            try {
                await this.organizationService.remove(organization.id);
                this.organizations.splice(this.organizations.indexOf(organization), 1);
                this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && this.organizations.length > 0;
                this.notificationService.success("", await this.wordTranslateService.translate("Successfully queued the organization for deletion."));
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to delete the organization."));
                throw ex;
            }
        };

        this.dialogService.confirm(this.viewRef, "Are you sure you want to delete this organization?", "Delete Project", modalCallBackFunction.bind(this));
    }
}

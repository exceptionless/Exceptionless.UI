import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { OrganizationService } from "../../service/organization.service";
import { ProjectService } from "../../service/project.service";
import { FilterService } from "../../service/filter.service";
import { SearchService } from "../../service/search.service";
import { NotificationService } from "../../service/notification.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { BillingService } from "../../service/billing.service";
import { Organization } from "src/app/models/organization";
import { Project } from "src/app/models/project";
import { EntityChanged } from "src/app/models/messaging";

@Component({
    selector: "app-organization-notification",
    templateUrl: "./organization-notification.component.html"
})

export class OrganizationNotificationComponent implements OnInit {
    public exceededRequestLimitOrganizations: Organization[];
    public freeOrganizations: Organization[];
    public hasNotifications: boolean = false;
    private organizations: Organization[];
    public organizationsWithoutPremiumFeatures: Organization[];
    public organizationsWithNoProjects: Organization[];
    public hourlyOverageOrganizations: Organization[];
    public monthlyOverageOrganizations: Organization[];
    public projects: Project[];
    public projectsRequiringConfiguration: Project[];
    public suspendedForBillingOrganizations: Organization[];
    public suspendedForAbuseOrOverageOrNotActiveOrganizations: Organization[];
    public suspendedOrganizations: Organization[];
    public organizationId: string;
    private ignoreFree: boolean = false;
    private ignoreConfigureProjects: boolean = false;
    private requiresPremium: boolean = false;
    private filterUsesPremiumFeatures: boolean = false;

    constructor(
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private filterService: FilterService,
        private searchService: SearchService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private viewRef: ViewContainerRef,
        private billingService: BillingService
    ) {}

    public async ngOnInit() {
        await this.get();
    }

    private async get(isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        try {
            await this.getOrganizations();
            await this.getProjects();
            await this.getFilterUsesPremiumFeatures();
            await this.getOrganizationNotifications();
        } catch (ex) {}
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!!message && message.type === "Organization") {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: message.id});
        }

        if (!!message && message.type === "Project") {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: message.organization_id, projectId: message.id});
        }

        if (!!message && message.type === "PersistentEvent" || message.type === "Stack") {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        return !message;
    }

    private getCurrentOrganizationId(): string {
        const getOrganizationFromProjectFilter = () => {
            if (!this.projects || !this.filterService.getProjectId()) {
                return null;
            }
            const projectId =  this.filterService.getProjectId();
            const project = this.projects.filter(o => o.id === projectId)[0];
            return project ? project.organization_id : null;
        };

        return this.organizationId || this.filterService.getOrganizationId() || getOrganizationFromProjectFilter();
    }

    private getCurrentProjects(): Project[] {
        const currentOrganizationId = this.organizationId || this.filterService.getOrganizationId();

        if (currentOrganizationId) {
            return this.projects.filter(p => p.organization_id === currentOrganizationId);
        }

        if (this.filterService.getProjectId()) {
            const projectId =  this.filterService.getProjectId();
            return this.projects.filter(p =>  p.id === projectId);
        }

        return this.projects;
    }

    private async getFilterUsesPremiumFeatures(): Promise<void> {
        this.filterUsesPremiumFeatures = false;

        try {
            const result = await this.searchService.validate(this.filterService.getFilter());
            this.filterUsesPremiumFeatures = result.uses_premium_features === true;
        } catch (ex) {
            this.notificationService.error("Error Occurred!", "Failed");
        }
    }

    private getOrganizationNotifications() {
        this.exceededRequestLimitOrganizations = [];
        this.freeOrganizations = [];
        this.hourlyOverageOrganizations = [];
        this.monthlyOverageOrganizations = [];
        this.projectsRequiringConfiguration = [];
        this.organizationsWithoutPremiumFeatures = [];
        this.organizationsWithNoProjects = [];
        this.suspendedForBillingOrganizations = [];
        this.suspendedForAbuseOrOverageOrNotActiveOrganizations = [];
        this.suspendedOrganizations = [];

        const currentOrganizationId = this.getCurrentOrganizationId();
        const currentProjects = this.getCurrentProjects();

        this.organizations.forEach(organization => {
            if (currentOrganizationId && organization.id !== currentOrganizationId) {
                return;
            }

            if (organization.is_suspended === true) {
                this.suspendedOrganizations.push(organization);

                if (organization.suspension_code === "Billing") {
                    this.suspendedForBillingOrganizations.push(organization);
                } else if (organization.billing_status !== 1 || organization.suspension_code === "Abuse" || organization.suspension_code === "Overage") {
                    this.suspendedForAbuseOrOverageOrNotActiveOrganizations.push(organization);
                }

                return;
            }

            // Only show it if you absolutely have no data or the current project has no data or if the current org has no data.
            const canShowConfigurationAlert = currentProjects.filter(p => p.is_configured === false).length === currentProjects.length;

            // Only show the premium features dialog when searching on a plan without premium features and your project has been configured.
            const tryingToSearchWithoutPremiumFeatures = this.filterUsesPremiumFeatures && !organization.has_premium_features;
            const upgradeRequiredForPremiumFeatures = this.requiresPremium && !organization.has_premium_features;

            if ((tryingToSearchWithoutPremiumFeatures || upgradeRequiredForPremiumFeatures) && !canShowConfigurationAlert) {
                this.organizationsWithoutPremiumFeatures.push(organization);
            }

            if (organization.is_over_monthly_limit === true) {
                this.monthlyOverageOrganizations.push(organization);
                return;
            }

            if (organization.is_over_hourly_limit === true) {
                this.hourlyOverageOrganizations.push(organization);
                return;
            }

            if (organization.is_over_request_limit === true) {
                this.exceededRequestLimitOrganizations.push(organization);
                return;
            }

            // Only show when there are no projects in the current selected organizations.
            if (currentProjects.length === 0) {
                this.organizationsWithNoProjects.push(organization);
                return;
            }

            if (!this.ignoreConfigureProjects && canShowConfigurationAlert) {
                let hasProjectsRequiringConfiguration = false;

                currentProjects.forEach(project => {
                    if (project.organization_id !== organization.id) {
                        return;
                    }

                    if (project.is_configured === false) {
                        this.projectsRequiringConfiguration.push(project);
                        hasProjectsRequiringConfiguration = true;
                    }
                });

                if (hasProjectsRequiringConfiguration) {
                    return;
                }
            }

            if (tryingToSearchWithoutPremiumFeatures || upgradeRequiredForPremiumFeatures) {
                return;
            }

            if (!this.ignoreFree && organization.plan_id === "EX_FREE") {
                this.freeOrganizations.push(organization);
            }
        });

        this.hasNotifications = true;
    }

    private async getOrganizations() {
        const getSelectedOrganization = async () => {
            const organizationId = this.getCurrentOrganizationId();
            if (!organizationId || this.organizations.filter(o => o.id === organizationId)[0]) {
                return;
            }

            try {
                const organization = await this.organizationService.getById(organizationId);
                this.organizations.push(organization);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
            }
        };

        const getAllOrganizations = async () => {
            try {
                this.organizations = await this.organizationService.getAll();
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
            }
        };

        await getAllOrganizations();
        await getSelectedOrganization();
    }

    private async getProjects() {
        try {
            this.projects = await this.projectService.getAll();
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        }
    }

    public hasExceededRequestLimitOrganizations() {
        return this.exceededRequestLimitOrganizations && this.exceededRequestLimitOrganizations.length > 0;
    }

    public hasFreeOrganizations() {
        return this.freeOrganizations && this.freeOrganizations.length > 0;
    }

    public hasHourlyOverageOrganizations() {
        return this.hourlyOverageOrganizations && this.hourlyOverageOrganizations.length > 0;
    }

    public hasMonthlyOverageOrganizations() {
        return this.monthlyOverageOrganizations && this.monthlyOverageOrganizations.length > 0;
    }

    public hasProjectsRequiringConfiguration() {
        return this.projectsRequiringConfiguration && this.projectsRequiringConfiguration.length > 0;
    }

    public hasOrganizations() {
        return this.organizations && this.organizations.length > 0;
    }

    public hasOrganizationsWithoutPremiumFeatures() {
        return this.organizationsWithoutPremiumFeatures && this.organizationsWithoutPremiumFeatures.length > 0;
    }

    public hasOrganizationsWithNoProjects() {
        return this.organizationsWithNoProjects && this.organizationsWithNoProjects.length > 0;
    }

    public hasSuspendedForBillingOrganizations() {
        return this.suspendedForBillingOrganizations && this.suspendedForBillingOrganizations.length > 0;
    }

    public hasSuspendedForAbuseOrOverageOrNotActiveOrganizations() {
        return this.suspendedForAbuseOrOverageOrNotActiveOrganizations && this.suspendedForAbuseOrOverageOrNotActiveOrganizations.length > 0;
    }

    public hasSuspendedOrganizations() {
        return this.suspendedOrganizations && this.suspendedOrganizations.length > 0;
    }

    public isIntercomEnabled() {
        return environment.INTERCOM_APPID;
    }

    public async onFilterChanged() {
        try {
            await this.getFilterUsesPremiumFeatures();
            await this.getOrganizationNotifications();
        } catch (ex) {}
    }

    public async showChangePlanDialog(organizationId: string) {
        if (!environment.STRIPE_PUBLISHABLE_KEY) {
            this.notificationService.error("", await this.wordTranslateService.translate("Billing is currently disabled."));
            return;
        }

        organizationId = organizationId || this.getCurrentOrganizationId();
        if (!organizationId && this.hasSuspendedOrganizations()) {
            organizationId = this.suspendedOrganizations[0].id;
        }

        if (!organizationId && this.hasMonthlyOverageOrganizations()) {
            organizationId = this.monthlyOverageOrganizations[0].id;
        }

        if (!organizationId && this.hasHourlyOverageOrganizations()) {
            organizationId = this.hourlyOverageOrganizations[0].id;
        }

        if (!organizationId && this.hasFreeOrganizations()) {
            organizationId = this.freeOrganizations[0].id;
        }

        await this.billingService.changePlan(this.viewRef, () => {}, organizationId);
    }

    public showIntercom() {
        // TODO: Show intercom.
    }
}

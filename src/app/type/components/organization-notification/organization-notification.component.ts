import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { OrganizationService } from '../../../service/organization.service';
import { ProjectService } from '../../../service/project.service';
import { FilterService } from '../../../service/filter.service';
import { SearchService } from '../../../service/search.service';
import { NotificationService } from '../../../service/notification.service';
import { GlobalVariables } from '../../../global-variables';

@Component({
    selector: 'app-organization-notification',
    templateUrl: './organization-notification.component.html',
    styleUrls: ['./organization-notification.component.less']
})

export class OrganizationNotificationComponent implements OnInit {
    exceededRequestLimitOrganizations: any[];
    freeOrganizations: any[];
    hasNotifications = false;
    organizations: any[];
    organizationsWithoutPremiumFeatures: any[];
    organizationsWithNoProjects: any[];
    hourlyOverageOrganizations: any[];
    monthlyOverageOrganizations: any[];
    projects: any[];
    projectsRequiringConfiguration: any[];
    suspendedForBillingOrganizations: any[];
    suspendedForAbuseOrOverageOrNotActiveOrganizations: any[];
    suspendedOrganizations: any[];
    organizationId = '';
    ignoreFree = '';
    ignoreConfigureProjects = '';
    requiresPremium = '';
    filterUsesPremiumFeatures = false;

    constructor(
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private filterService: FilterService,
        private searchService: SearchService,
        private notificationService: NotificationService,
        private _global: GlobalVariables,
    ) {}

    ngOnInit() {
        this.get();
    }

    get() {
        this.getOrganizations().then(() => { this.getProjects().then( () => { this.getFilterUsesPremiumFeatures().then(() => { this.getOrganizationNotifications(); }); } ); });
    }

    getCurrentOrganizationId() {
        const getOrganizationFromProjectFilter = () => {
            if (!this.projects || !this.filterService.getProjectId()) {
                return null;
            }

            const project = this.projects.filter(function(o) { return o.id === this.filterService.getProjectId(); })[0];
            return project ? project.organization_id : null;
        };

        return this.organizationId || this.filterService.getOrganizationId() || getOrganizationFromProjectFilter();
    }

    getCurrentProjects() {
        const currentOrganizationId = this.organizationId || this.filterService.getOrganizationId();

        if (currentOrganizationId) {
            return this.projects.filter(function (p) { return p.organization_id === currentOrganizationId; });
        }

        if (this.filterService.getProjectId()) {
            return this.projects.filter(function (p) { return p.id === this.filterService.getProjectId(); });
        }

        return this.projects;
    }

    getFilterUsesPremiumFeatures() {
        this.filterUsesPremiumFeatures = false;

        return new Promise((resolve, reject) => {
            this.searchService.validate(this.filterService.getFilter()).then(
                (res) => {
                    this.filterUsesPremiumFeatures = res['data'].uses_premium_features === true;
                    resolve( this.filterUsesPremiumFeatures);
                },
                (err) => {
                    this.notificationService.error('Error Occurred!', 'Failed');

                    reject(err);
                }
            );
        });
    }

    getOrganizationNotifications() {
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

                if (organization.suspension_code === 'Billing') {
                    this.suspendedForBillingOrganizations.push(organization);
                } else if (organization.billing_status !== 1 || organization.suspension_code === 'Abuse' || organization.suspension_code === 'Overage') {
                    this.suspendedForAbuseOrOverageOrNotActiveOrganizations.push(organization);
                }

                return;
            }

            // Only show it if you absolutely have no data or the current project has no data or if the current org has no data.
            const canShowConfigurationAlert = currentProjects.filter(function(p) { return p.is_configured === false; }).length === currentProjects.length;

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

            if (!this.ignoreFree && organization.plan_id === 'EX_FREE') {
                this.freeOrganizations.push(organization);
            }
        });

        this.hasNotifications = true;
    }

    getOrganizations() {
        const getSelectedOrganization = () => {
            const organizationId = this.getCurrentOrganizationId();

            if (!organizationId || this.organizations.filter(function(o) { return o.id === organizationId; })[0]) {
                return;
            }

            return new Promise((resolve, reject) => {
                this.organizationService.getById(organizationId, false).subscribe(
                    res => {
                        this.organizations.push(JSON.parse(JSON.stringify(res)));

                        // getSelectedOrganization();
                        resolve(this.organizations);
                    },
                    err => {
                        this.notificationService.error('Failed', 'Error Occurred!');

                        reject(err);
                    }
                );
            });
        };

        const getAllOrganizations = () => {
            return new Promise((resolve, reject) => {
                this.organizationService.getAll('', false).subscribe(
                    res => {
                        this.organizations = JSON.parse(JSON.stringify(res));

                        // getSelectedOrganization();
                        resolve(this.organizations);
                    },
                    err => {
                        this.notificationService.error('Failed', 'Error Occurred!');

                        reject(err);
                    }
                );
            });
        };

        return getAllOrganizations().then(() => { getSelectedOrganization(); });
    }

    getProjects() {
        return new Promise((resolve, reject) => {
            this.projectService.getAll('', false).subscribe(
                res => {
                    this.projects = JSON.parse(JSON.stringify(res));

                    // getSelectedOrganization();
                    resolve(this.projects);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');

                    reject(err);
                }
            );
        });
    }

    hasExceededRequestLimitOrganizations() {
        return this.exceededRequestLimitOrganizations && this.exceededRequestLimitOrganizations.length > 0;
    }

    hasFreeOrganizations() {
        return this.freeOrganizations && this.freeOrganizations.length > 0;
    }

    hasHourlyOverageOrganizations() {
        return this.hourlyOverageOrganizations && this.hourlyOverageOrganizations.length > 0;
    }

    hasMonthlyOverageOrganizations() {
        return this.monthlyOverageOrganizations && this.monthlyOverageOrganizations.length > 0;
    }

    hasProjectsRequiringConfiguration() {
        return this.projectsRequiringConfiguration && this.projectsRequiringConfiguration.length > 0;
    }

    hasOrganizations() {
        return this.organizations && this.organizations.length > 0;
    }

    hasOrganizationsWithoutPremiumFeatures() {
        return this.organizationsWithoutPremiumFeatures && this.organizationsWithoutPremiumFeatures.length > 0;
    }

    hasOrganizationsWithNoProjects() {
        return this.organizationsWithNoProjects && this.organizationsWithNoProjects.length > 0;
    }

    hasSuspendedForBillingOrganizations() {
        return this.suspendedForBillingOrganizations && this.suspendedForBillingOrganizations.length > 0;
    }

    hasSuspendedForAbuseOrOverageOrNotActiveOrganizations() {
        return this.suspendedForAbuseOrOverageOrNotActiveOrganizations && this.suspendedForAbuseOrOverageOrNotActiveOrganizations.length > 0;
    }

    hasSuspendedOrganizations() {
        return this.suspendedOrganizations && this.suspendedOrganizations.length > 0;
    }

    isIntercomEnabled() {
        return this._global.INTERCOM_APPID;
    }

    onFilterChanged() {
        return this.getFilterUsesPremiumFeatures().then( () => { this.getOrganizationNotifications(); });
    }

    showChangePlanDialog(organizationId) {
        if (!this._global.STRIPE_PUBLISHABLE_KEY) {
            this.notificationService.error('Failed', 'Billing is currently disabled.');
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

        // need to implement yet [Exceptionless]
        // return billingService.changePlan(organizationId).catch(function(e){});
        return false;
    }

    showIntercom() {}
}

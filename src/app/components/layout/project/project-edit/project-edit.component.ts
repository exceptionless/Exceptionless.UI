import { Component, OnInit, ViewContainerRef, OnDestroy } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FilterService } from "../../../../service/filter.service";
import { OrganizationService } from "../../../../service/organization.service";
import { ProjectService } from "../../../../service/project.service";
import { TokenService } from "../../../../service/token.service";
import { WebHookService } from "../../../../service/web-hook.service";
import { NotificationService } from "../../../../service/notification.service";
import * as moment from "moment";
import { WordTranslateService } from "../../../../service/word-translate.service";
import { BillingService } from "../../../../service/billing.service";
import { DialogService } from "../../../../service/dialog.service";
import { formatNumber } from "@angular/common";
import { ThousandSuffixPipe } from "../../../../pipes/thousand-suffix.pipe";
import { Subscription } from "rxjs";
import { Project, NotificationSettings } from "src/app/models/project";
import { Organization } from "src/app/models/organization";
import { Token, NewToken } from "src/app/models/token";
import { EntityChanged, ChangeType } from "src/app/models/messaging";
import { WebHook } from "src/app/models/webhook";
import { NgForm } from "@angular/forms";

@Component({
    selector: "app-project-edit",
    templateUrl: "./project-edit.component.html"
})

export class ProjectEditComponent implements OnInit, OnDestroy {
    private _ignoreRefresh: boolean = false;
    private _projectId: string;
    public canChangePlan: boolean = false;
    public excludePrivateInformation: boolean = false;
    public apexChart: any = {
        options: {
            chart: {
                height: 200,
                type: "area",
                stacked: true,
                events: {
                    zoomed: (chartContext, { xaxis, yaxis }) => {
                        const start = moment(xaxis.min).utc().local();
                        const end = moment(xaxis.max).utc().local();
                        this.filterService.setTime(start.format("YYYY-MM-DDTHH:mm:ss") + "-" + end.format("YYYY-MM-DDTHH:mm:ss"));

                        // $ExceptionlessClient.createFeatureUsage('app.session.Dashboard.chart.range.onSelection')
                        //     .setProperty('start', start)
                        //     .setProperty('end', end)
                        //     .submit();

                        return false;
                    }
                },
                tooltip: {
                    x: {
                        format: "dd MMM yyyy"
                    }
                },
                toolbar: {
                    show: true,
                    tools: {
                        pan: false,
                    }
                }
            },
            colors: ["rgba(245, 245, 245, 0.7)", "rgba(164, 213, 111, 0.7)", "rgba(226, 226, 226, 0.7)", "rgba(204, 204, 204, 0.7)", "rgba(169, 68, 66, 0.7)"],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth"
            },

            series: [],
            fill: {
                gradient: {
                    enabled: true,
                    opacityFrom: 0.6,
                    opacityTo: 0.8,
                }
            },
            legend: {
                position: "top",
                horizontalAlign: "left"
            },
            xaxis: {
                type: "datetime"
            },
            yaxis: {
                labels: {
                    formatter: (rep) => {
                        return this.thousandSuffixPipe.transform(rep);
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: (rep) => {
                        return formatNumber(rep, "en");
                    }
                }
            }
        },
        seriesData: []
    };

    public config: {key: string, value: string, is_editable: boolean}[];
    public commonMethods: string;
    public dataExclusions: string;
    public hasMonthlyUsage : boolean= true;
    public hasPremiumFeatures: boolean = false;
    public isSlackEnabled: boolean = !!environment.SLACK_APPID;
    public nextBillingDate: Date = moment().startOf("month").add(1, "months").toDate();
    public organization: Organization;
    public project: Project;
    public projectForm: NgForm;
    public remainingEventLimit: number = 3000;
    public slackNotificationSettings: NotificationSettings;
    public tokens: Token[];
    public userAgents: string;
    public userNamespaces: string;
    public webHooks: WebHook[];
    public editable: boolean[] = [];
    private subscriptions: Subscription[];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private viewRef: ViewContainerRef,
        private filterService: FilterService,
        private organizationService: OrganizationService,
        private projectService: ProjectService,
        private tokenService: TokenService,
        private webHookService: WebHookService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService,
        private billingService: BillingService,
        private dialogService: DialogService,
        private thousandSuffixPipe: ThousandSuffixPipe
    ) {}

    public async ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe(async (params) => {
            this._projectId = params.id;
            await this.get();
        }));
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public async addConfiguration() {
        await this.dialogService.addConfiguration(this.viewRef, this.saveClientConfiguration.bind(this));
    }

    public async saveClientConfiguration(data: any) {
        if (!data.value) {
            return;
        }

        try {
            this.projectService.setConfig(this._projectId, data.key, data.value);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the configuration setting."));
        }
    }

    public async addSlack() {
        if (!this.hasPremiumFeatures) {
            return this.billingService.confirmUpgradePlan(this.viewRef, "Please upgrade your plan to enable slack integration.", this.project.organization_id, async () => {
                await this.addSlackIntegration();
            });
        }

        await this.addSlackIntegration();
    }

    private async addSlackIntegration() {
        try {
            await this.projectService.addSlack(this._projectId);
            this.notificationService.success("", await this.wordTranslateService.translate("Successfully added"));
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while adding Slack to your project."));
        }
    }

    public async addToken() {
        const mewToken: NewToken = {
            organization_id: this.project.organization_id,
            project_id: this._projectId
        };

        try {
            const res = await this.tokenService.create(mewToken);
            this.tokens.push(res);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while creating a new API key for your project."));
        }
    }

    public addWebHook() {
        this.dialogService.addWebHook(this.viewRef, this.createWebHook.bind(this));
    }

    public changePlan() {
        this.billingService.changePlan(this.viewRef, () => {}, this.project.organization_id);
    }

    private createWebHook(data) {
        const onFailure = async (ex: HttpErrorResponse) => {
            if (ex.status === 426) {
                return this.billingService.confirmUpgradePlan(this.viewRef, ex.error.message, this.project.organization_id, () => {
                    return this.createWebHook(data);
                });
            }
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the configuration setting."));
        };

        return this.webHookService.create(Object.assign(data, { project_id: this._projectId })).catch(onFailure.bind(this));
    }

    public async copied() {
        this.notificationService.success("", await this.wordTranslateService.translate("Copied"));
    }

    public async get(message?: EntityChanged) {
        if (this._ignoreRefresh) {
            return;
        }

        if (message && message.type === "Project" && message.change_type === ChangeType.Removed && message.id === this._projectId) {
            await this.router.navigate(["/type/project/list"]);
            this.notificationService.error("", await this.wordTranslateService.translate("Project_Deleted"));
            return;
        }

        try {
            await this.getProject();
            await this.getOrganization();
            await this.getConfiguration();
            await this.getTokens();
            await this.getSlackNotificationSettings();
            await this.getWebHooks();
        } catch (ex) {
            await this.router.navigate(["/project/list"]);
        }
    }

    public async getOrganization() {
        try {
            this.organization = await this.organizationService.getById(this.project.organization_id);
            const getRemainingEventLimit = (organization) => {
                if (!organization.max_events_per_month) {
                    return 0;
                }

                const bonusEvents = moment.utc().isBefore(moment.utc(organization.bonus_expiration)) ? organization.bonus_events_per_month : 0;
                const usage = organization.usage && organization.usage[organization.usage.length - 1];
                if (usage && moment.utc(usage.date).isSame(moment.utc().startOf("month"))) {
                    const remaining = usage.limit - (usage.total - usage.blocked);
                    return remaining > 0 ? remaining : 0;
                }

                return organization.max_events_per_month + bonusEvents;
            };

            this.hasMonthlyUsage = this.organization.max_events_per_month > 0;
            this.remainingEventLimit = getRemainingEventLimit(this.organization);
            this.canChangePlan = !!environment.STRIPE_PUBLISHABLE_KEY && !!this.organization;

            this.organization.usage = (this.organization.usage || [{ date: moment.utc().startOf("month").toISOString(), total: 0, blocked: 0, limit: this.organization.max_events_per_month, too_big: 0 }]).filter((usage) => {
                return this.project.usage.some(u => moment(u.date).isSame(usage.date));
            });

            this.apexChart.seriesData = [];

            this.apexChart.seriesData.push({
                name: "Allowed in Organization",
                data: this.organization.usage.map((item) => {
                    return [moment.utc(item.date), item.total - item.blocked - item.too_big];
                })
            });

            this.apexChart.seriesData.push({
                name: "Allowed",
                data: this.project.usage.map((item) => {
                    return [moment.utc(item.date), item.total - item.blocked - item.too_big];
                })
            });

            this.apexChart.seriesData.push({
                name: "Blocked",
                data: this.project.usage.map((item) => {
                    return [moment.utc(item.date), item.blocked];
                })
            });

            this.apexChart.seriesData.push({
                name: "Too Big",
                data: this.project.usage.map((item) => {
                    return [moment.utc(item.date), item.too_big];
                })
            });

            this.apexChart.seriesData.push({
                name: "Limit",
                data: this.organization.usage.map((item) => {
                    return [moment.utc(item.date), item.limit];
                })
            });
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Cannot_Find_Organization", {organizationId: this.project.organization_id}));
            throw ex;
        }
    }

    private async getProject() {
        try {
            this.project = await this.projectService.getById(this._projectId);
            this.commonMethods = null;
            this.userNamespaces = null;

            this.hasPremiumFeatures = this.project.has_premium_features;
            if (this.project && this.project.data) {
                this.commonMethods = this.project.data.CommonMethods;
                this.userNamespaces = this.project.data.UserNamespaces;
            }

            this.project.usage = this.project.usage || [{ date: moment.utc().startOf("month").toISOString(), total: 0, blocked: 0, limit: 3000, too_big: 0 }];
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Cannot_Find_Project", {projectId: this._projectId}));
            throw ex;
        }
    }

    public async getTokens() {
        try {
            this.tokens = await this.tokenService.getByProjectId(this._projectId);
            this.tokens.forEach((item, key) => {
                this.editable[key] = false;
            });
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred loading the api keys."));
            throw ex;
        }
    }

    private async getConfiguration() {
        try {
            const response: any = await this.projectService.getConfig(this._projectId);
            this.config = [];
            this.dataExclusions = null;
            this.userAgents = null;
            this.excludePrivateInformation = false;

            Object.keys(response.settings).map((key) => {
                if (key === "@@DataExclusions") {
                    this.dataExclusions = response.settings[key];
                } else if (key === "@@UserAgentBotPatterns") {
                    this.userAgents = response.settings[key];
                } else if (key === "@@IncludePrivateInformation") {
                    this.excludePrivateInformation = response.settings[key] === "false";
                } else {
                    this.config.push({key, value: response.settings[key], is_editable: false});
                }
            });

        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred loading the notification settings."));
            throw ex;
        }
    }

    public async saveIncludePrivateInformation() {
        try {
            if (this.excludePrivateInformation) {
                await this.projectService.setConfig(this._projectId, "@@IncludePrivateInformation", false);
            } else {
                await this.projectService.removeConfig(this._projectId, "@@IncludePrivateInformation");
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the include private information setting."));
        }
    }

    private async getSlackNotificationSettings() {
        this.slackNotificationSettings = null;
        try {
            this.slackNotificationSettings = await this.projectService.getIntegrationNotificationSettings(this._projectId, "slack");
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while loading the slack notification settings."));
            throw ex;
        }
    }

    public async getWebHooks() {
        try {
            this.webHooks = await this.webHookService.getByProjectId(this._projectId);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred loading the notification settings."));
            throw ex;
        }
    }

    public async removeConfig(config) {
        const modalCallBackFunction = async () => {
            try {
                await this.projectService.removeConfig(this._projectId, config.key);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to delete the configuration setting."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this configuration setting?", "DELETE CONFIGURATION SETTING", modalCallBackFunction);
    }

    public async removeProject() {
        const modalCallBackFunction = async () => {
            this._ignoreRefresh = true;
            try {
                await this.projectService.remove(this._projectId);
                await this.router.navigate(["/project/list"]);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to delete the project."));
                this._ignoreRefresh = false;
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this project?", "Delete Project", modalCallBackFunction);
    }

    public async removeSlack() {
        const modalCallBackFunction = async () => {
            try {
                await this.projectService.removeSlack(this._projectId);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to remove slack."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to remove slack support?", "Remove Slack", modalCallBackFunction);
    }

    public async removeToken(token) {
        const modalCallBackFunction = async () => {
            try {
                await this.tokenService.remove(token.id);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to delete the API Key."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this API key?", "DELETE API KEY", modalCallBackFunction);
    }

    public async removeWebHook(hook) {
        const modalCallBackFunction = async () => {
            try {
                await this.webHookService.remove(hook.id);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while trying to delete the web hook."));
                throw ex;
            }
        };

        await this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this web hook?", "DELETE WEB HOOK", modalCallBackFunction);
    }

    public async resetData() {
        const modalCallBackFunction = async () => {
            try {
                await this.projectService.resetData(this._projectId);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while resetting project data."));
                throw ex;
            }
        };

        await this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to reset the data for this project?", "RESET PROJECT DATA", modalCallBackFunction);
    }

    public async save(isValid: boolean) {
        if (!isValid) {
            return;
        }

        try {
            await this.projectService.update(this._projectId, this.project);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the project."));
        }
    }

    public async saveApiKeyNote(data: Token) {
        try {
            await this.tokenService.update(data.id, { notes: data.notes } as Token);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the API key note."));
        }
    }

    public async saveCommonMethods() {
        try {
            if (this.commonMethods) {
                await this.projectService.setData(this._projectId, "CommonMethods", this.commonMethods);
            } else {
                await this.projectService.removeData(this._projectId, "CommonMethods");
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the common methods."));
        }
    }

    public async saveDataExclusion() {
        try {
            if (this.dataExclusions) {
                await this.projectService.setConfig(this._projectId, "@@DataExclusions", this.dataExclusions);
            } else {
                await this.projectService.removeConfig(this._projectId, "@@DataExclusions");
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the data exclusion."));
        }
    }

    public async saveDeleteBotDataEnabled() {
        try {
            await this.projectService.update(this._projectId, { delete_bot_data_enabled: this.project.delete_bot_data_enabled } as Project);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the project."));
        }
    }

    public async saveUserAgents() {
        try {
            if (this.userAgents) {
                await this.projectService.setConfig(this._projectId, "@@UserAgentBotPatterns", this.userAgents);
            } else {
                await this.projectService.removeConfig(this._projectId, "@@UserAgentBotPatterns");
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the user agents."));
        }
    }

    public async saveUserNamespaces() {
        try {
            if (this.userNamespaces) {
                await this.projectService.setData(this._projectId, "UserNamespaces", this.userNamespaces);
            } else {
                await this.projectService.removeData(this._projectId, "UserNamespaces");
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving the user namespaces."));
        }
    }

    public async saveSlackNotificationSettings() {
        try {
            await this.projectService.setIntegrationNotificationSettings(this._projectId, "slack", this.slackNotificationSettings);
        } catch (ex: HttpErrorResponse) { // TODO: Verify ex has status code...
            if (ex.status === 426) {
                try {
                    return this.billingService.confirmUpgradePlan(this.viewRef, ex.error.message, this.project.organization_id, () => {
                        return this.saveSlackNotificationSettings();
                    });
                } catch (ex) {
                    return this.getSlackNotificationSettings();
                }
            }

            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while saving your slack notification settings."));
        }
    }

    public showChangePlanDialog() {
        // TODO: implement show billing dialog.
    }

    private validateApiKeyNote(original, data) { // TODO: Ensure this being validated.. might need to check old site.
        if (original === data) {
            return false;
        }

        return null;
    }

    private async validateClientConfiguration(original, data) { // TODO: Ensure this being validated.. might need to check old site.
        if (original === data) {
            return false;
        }

        return !data ? await this.wordTranslateService.translate("Please enter a valid value.") : null;
    }
}

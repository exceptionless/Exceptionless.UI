import { Component, OnInit, ViewContainerRef, OnDestroy } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { HotkeysService, Hotkey } from "angular2-hotkeys";
import * as moment from "moment";
import { BillingService } from "../../../service/billing.service";
import { EventService } from "../../../service/event.service";
import { FilterService } from "../../../service/filter.service";
import { NotificationService } from "../../../service/notification.service";
import { ProjectService } from "../../../service/project.service";
import { StackService } from "../../../service/stack.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import { WordTranslateService } from "../../../service/word-translate.service";
import { DialogService } from "../../../service/dialog.service";
import { formatNumber } from "@angular/common";
import { ThousandSuffixPipe } from "../../../pipes/thousand-suffix.pipe";
import { Subscription } from "rxjs";
import { Project } from "src/app/models/project";
import { Stack } from "src/app/models/stack";
import { EntityChanged } from "src/app/models/messaging";

@Component({
    selector: "app-stack",
    templateUrl: "./stack.component.html"
})

export class StackComponent implements OnInit, OnDestroy {
    private _stackId: string;
    public eventType = "stack"; // TODO: Why is this needed?
    public chartOptions = [ // TODO: See if this is hooked up.
        { name: "Occurrences", field: "sum:count~1", title: "", selected: true, render: false },
        { name: "Average Value", field: "avg:value", title: "The average of all event values", selected: false, render: true },
        { name: "Value Sum", field: "sum:value", title: "The sum of all event values", selected: false, render: true }
    ];
    public apexChart: any = { // TODO: Add typings for all apex charts and lets ensure it's set correctly.
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
                    tools: {
                        pan: false,
                        download: true,
                        customMenu: [{
                            title: (this.chartOptions[1].selected ? "Hide" : "Show") + " Average Value",
                            on_select: () => {
                                this.chartOptions[1].selected = !this.chartOptions[1].selected;
                                this.updateStats();
                            }
                        }, {
                            title: (this.chartOptions[2].selected ? "Hide" : "Show") + " Value Sum",
                            on_select: () => {
                                this.chartOptions[2].selected = !this.chartOptions[2].selected;
                                this.updateStats();
                            }
                        }]
                    }
                },
            },
            colors: ["rgba(124, 194, 49, .7)", "rgba(60, 116, 0, .9)", "rgba(89, 89, 89, .3)"],
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
        seriesData: [],
        updatedOptions: {}
    };
    public project: Project; // TODO: Fix all the view model binding where it's using object indexers... as well as use the elvis operator: project?.name
    public recentOccurrences = {
        get: (options) => {
            return this.eventService.getByStackId(this._stackId, options);
        },
        summary: {
            showType: false
        },
        options: {
            limit: 10,
            mode: "summary"
        }
    };
    stack: Stack;
    public stats = {
        count: 0,
        users: this.buildUserStat(0, 0),
        usersTitle: this.buildUserStatTitle(0, 0),
        first_occurrence: undefined,
        last_occurrence: undefined
    };
    private users: number;
    private totalUsers: number; // TODO: Figure out if these were here before and if this can be simplified.
    private action: string;
    private subscriptions: Subscription[];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private hotkeysService: HotkeysService,
        private billingService: BillingService,
        private eventService: EventService,
        private filterService: FilterService,
        private notificationService: NotificationService,
        private projectService: ProjectService,
        private stackService: StackService,
        private viewRef: ViewContainerRef,
        private dialogService: DialogService,
        private filterStoreService: FilterStoreService,
        private wordTranslateService: WordTranslateService,
        private thousandSuffixPipe: ThousandSuffixPipe
    ) {
        this.hotkeysService.add(new Hotkey("shift+h", (event: KeyboardEvent): boolean => {
            this.updateIsHidden();
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+f", (event: KeyboardEvent): boolean => {
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+c", (event: KeyboardEvent): boolean => {
            this.updateIsCritical();
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+m", (event: KeyboardEvent): boolean => {
            this.updateNotifications();
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+p", (event: KeyboardEvent): boolean => {
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+r", (event: KeyboardEvent): boolean => {
            this.addReferenceLink();
            return false;
        }));

        this.hotkeysService.add(new Hotkey("shift+backspace", (event: KeyboardEvent): boolean => {
            return false;
        }));
    }

    public async ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            this._stackId = params.id;
            this.filterStoreService.setEventType(params.type);
        }));

        await this.get();
        await this.executeAction(); // TODO: This stack action (action property) should be coming from a route param.... Verify in previous app.
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public async addReferenceLink() {
        const modalCallBackFunction = async (url) => {
            if (this.stack.references.indexOf(url) < 0) {
                this.stackService.addLink(this._stackId, url);

                try {
                    await this.stackService.addLink(this._stackId, url);
                    this.stack.references.push(url);
                } catch (ex) {
                    this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while adding the reference link."));
                    throw ex;
                }
            }
        };

        return this.dialogService.addReference(this.viewRef, modalCallBackFunction);
    }

    private buildUserStat(users: number, totalUsers: number) {
        if (totalUsers === 0) {
            return 0;
        }

        const percent = users / totalUsers * 100.0;
        return percent;
    }

    private buildUserStatTitle(users: number|any, totalUsers: number|any) { // Fix and verify typings where needed here...
        return parseInt(users, 10) + " of " + parseInt(totalUsers, 10) +  " users";
    }

    private async executeAction() {
        const action = this.action;
        if (action === "mark-fixed" && !(this.stack.date_fixed && !this.stack.is_regressed)) {
            await this.updateIsFixed(true);
        } else if (action === "stop-notifications" && !this.stack.disable_notifications) {
            await this.updateNotifications(true);
        }
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (message && message.type === "Stack" && message.id === this._stackId) {
            return true;
        }

        if (message && message.type === "PersistentEvent") {
            if (message.organization_id && message.organization_id !== this.stack.organization_id) {
                return false;
            }
            if (message.project_id && message.project_id !== this.stack.project_id) {
                return false;
            }

            if (message.stack_id && message.stack_id !== this._stackId) {
                return false;
            }

            return true;
        }

        return false;
    }

    private async get(data?: any) { // TODO: There is a mismatch here and we need to check previous ui.. data being passed in should be entity changed but looks like were passing current paging query string data which would be wrong.
        if (data && !this.canRefresh(data)) {
            return;
        }

        if (data && data.type === "Stack" && data.deleted) {
            this.notificationService.error("", await this.wordTranslateService.translate("Stack_Deleted"));
            this.router.navigate(["/type/events/dashboard"]);
            return;
        }

        if (data && data.type === "PersistentEvent") {
            return this.updateStats();
        }

        try {
            await this.getStack();
            await this.updateStats();
            await this.getProject();
        } catch (ex) {}
    }

    private async getProject() {
        try {
            this.project = await this.projectService.getById(this.stack.project_id);
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        }
    }

    private async getStack() {
        try {
            this.stack = await this.stackService.getById(this._stackId);
            this.stack.references = this.stack.references || [];
        } catch (ex) {
            if (ex.status === 404) {
                this.notificationService.error("", await this.wordTranslateService.translate("Cannot_Find_Stack"));
            } else {
                this.notificationService.error("", await this.wordTranslateService.translate("Error_Load_Stack"));
            }

            this.router.navigate(["/type/events/dashboard"]);
            return ex;
        }
    }

    private async getProjectUserStats() {
        const optionsCallback: any = (options: any) => { // TODO: We need good tying on this...
            options.filter = "project:" + this.stack.project_id;
            return options;
        };

        try {
            const result = await this.eventService.count("cardinality:user", optionsCallback);
            const getAggregationValue = (data, name, defaultValue) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            this.totalUsers = getAggregationValue(result, "cardinality_user", 0);
            this.stats.users = this.buildUserStat(this.users, this.totalUsers);
            this.stats.usersTitle = this.buildUserStatTitle(this.users, this.totalUsers);
        } catch (ex) {
            // TODO: Log or throw or empty?
        }
    }

    private async updateStats() {
        try {
            this.apexChart.updatedOptions = {
                chart: {
                    toolbar: {
                        tools: {
                            customMenu: [{
                                title: (this.chartOptions[1].selected ? "Hide" : "Show") + " Average Value",
                                on_select: async () => {
                                    this.chartOptions[1].selected = !this.chartOptions[1].selected;
                                    await this.updateStats();
                                }
                            }, {
                                title: (this.chartOptions[2].selected ? "Hide" : "Show") + " Value Sum",
                                on_select: async () => {
                                    this.chartOptions[2].selected = !this.chartOptions[2].selected;
                                    await this.updateStats();
                                }
                            }]
                        }
                    },
                }
            };

            await this.getStats();
        } catch (ex) {
            debugger;
        }
    }

    private async getStats() {
        const buildFields = (options) => {
            return " cardinality:user " + options.filter(option => option.selected)
                .reduce((fields, option) => { fields.push(option.field); return fields; }, [])
                .join(" ");
        };

        const optionsCallback = (options) => {
            options.filter = ["stack:" + this._stackId, options.filter].filter(f => f && f.length > 0).join(" ");
            return options;
        };

        const offset = this.filterService.getTimeOffset();
        try {
            const response: any = await this.eventService.count("date:(date" + (offset ? "^" + offset : "") + buildFields(this.chartOptions) + ") min:date max:date cardinality:user sum:count~1", optionsCallback, false);
            const getAggregationValue = (data, name, defaultValue?) => { // TODO: We need better typing here.
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            const getAggregationItems = (data, name, defaultValue?) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            };

            this.users = getAggregationValue(response, "cardinality_user", 0);
            this.stats = {
                count: getAggregationValue(response, "sum_count", 0).toFixed(0),
                users: this.buildUserStat(this.users, this.totalUsers),
                usersTitle: this.buildUserStatTitle(this.users, this.totalUsers),
                first_occurrence: getAggregationValue(response, "min_date"),
                last_occurrence: getAggregationValue(response, "max_date")
            };

            const dateAggregation = getAggregationItems(response, "date_date", []);
            const colors = ["rgba(124, 194, 49, .7)", "rgba(60, 116, 0, .9)", "rgba(89, 89, 89, .3)"];
            this.apexChart.seriesData = this.chartOptions
                .filter(option => option.selected)
                .reduce((series, option, index) => {
                    series.push({
                        name: option.name,
                        data: dateAggregation.map(item => {
                            const getYValue = (itemValue, key) => {
                                let field = option.field.replace(":", "_");
                                const proximity = field.indexOf("~");
                                if (proximity !== -1) {
                                    field = field.substring(0, proximity);
                                }

                                return getAggregationValue(itemValue, field, 0);
                            };
                            return [moment(item.key), getYValue(item, index)];
                        })
                    });

                    return series;
                }, [])
                .sort((a, b) => {
                    const calculateSum = (previous, current) => {
                        return previous + current.y;
                    };

                    return b.data.reduce(calculateSum, 0) - a.data.reduce(calculateSum, 0);
                })
                .map((seri, index) => {
                    seri.color = colors[index];
                    return seri;
                });

            this.getProjectUserStats();
        } catch (ex) {
            // TODO: Should we log or rethrow this? What were we doing before?
        }
    }

    public hasSelectedChartOption() {
        return this.chartOptions.filter(o => o.render && o.selected).length > 0;
    }

    public isValidDate(date) {
        const d = moment(date);
        return !!date && d.isValid() && d.year() > 1;
    }

    public async promoteToExternal() {
        if (this.project && !this.project.has_premium_features) {
            const message = await this.wordTranslateService.translate("Promote to External is a premium feature used to promote an error stack to an external system. Please upgrade your plan to enable this feature.");
            return await this.billingService.confirmUpgradePlan(this.viewRef, message, this.stack.organization_id, async () => {
                return await this.promoteToExternal();
            });
        }

        try {
            await this.stackService.promote(this._stackId);
            this.notificationService.success("", await this.wordTranslateService.translate("Successfully promoted stack!"));
        } catch (ex) {
            if (ex === 426) { // TODO: figure out if the api call throws a network exception that has the status code.
                return this.billingService.confirmUpgradePlan(this.viewRef, ex.error.message, this.stack.organization_id, async () => {
                    return await this.promoteToExternal();
                });
            }

            if (ex.status === 501) {
                return this.dialogService.confirm(this.viewRef, ex.error.message, "Manage Integrations", async () => {
                    await this.router.navigate([`/project/${this.stack.project_id}/manage`]);
                });
            }

            this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while promoting this stack."));
        }
    }

    public async removeReferenceLink(reference) {
        const modalCallBackFunction = async () => {
            try {
                await this.stackService.removeLink(this._stackId, reference);
                this.stack.references = this.stack.references.filter(item => item !== reference);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while deleting the external reference link."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this reference link?", "DELETE REFERENCE LINK", modalCallBackFunction);
    }

    public async remove() {
        const modalCallBackFunction = async () => {
            try {
                await this.stackService.remove(this._stackId);
                this.notificationService.error("", await this.wordTranslateService.translate("Successfully queued the stack for deletion."));
                await this.router.navigate([`/project/${this.stack.project_id}/dashboard`]);
            } catch (ex) {
                this.notificationService.error("", await this.wordTranslateService.translate("An error occurred while deleting this stack."));
                throw ex;
            }
        };

        this.dialogService.confirmDanger(this.viewRef, "Are you sure you want to delete this stack (includes all stack events)?", "DELETE STACK", modalCallBackFunction);
    }

    public async updateIsCritical() {
        try {
            if (this.stack.occurrences_are_critical) {
                await this.stackService.markNotCritical(this._stackId);
            } else {
                await this.stackService.markCritical(this._stackId);
            }

            this.stack.occurrences_are_critical = !this.stack.occurrences_are_critical;
            // TODO: Verify that we didn't previously have a success toast.
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate(this.stack.occurrences_are_critical ? "An error occurred while marking future occurrences as not critical." : "An error occurred while marking future occurrences as critical."));
        }
    }

    public async updateIsFixed(showSuccessNotification: boolean) {
        const onSuccess = async () => {
            if (showSuccessNotification) {
                this.notificationService.info("", await this.wordTranslateService.translate((this.stack.date_fixed && !this.stack.is_regressed) ? "Successfully queued the stack to be marked as not fixed." : "Successfully queued the stack to be marked as fixed."));
            }
        };

        const onFailure = async () => {
            this.notificationService.error("", await this.wordTranslateService.translate((this["stack.date_fixed"] && !this.stack.is_regressed) ? "An error occurred while marking this stack as not fixed." : "An error occurred while marking this stack as fixed."));
        };

        if (this.stack.date_fixed && !this.stack.is_regressed) {
            try {
                await this.stackService.markNotFixed(this._stackId);
                this.stack.date_fixed = null;
                await onSuccess();
            } catch (ex) {
                await onFailure();
            }
        } else {
            await this.dialogService.markFixed(this.viewRef, async versionNumber => {
                try {
                    await this.stackService.markFixed([this._stackId], versionNumber);
                    this.stack.date_fixed = new Date();
                    this.stack.fixed_in_version = versionNumber;
                    await onSuccess();
                } catch (ex) {
                    await onFailure();
                }
            });
        }
    }

    public async updateIsHidden() {
        try {
            if (this.stack.is_hidden) {
                await this.stackService.markHidden(this._stackId);
            } else {
                await this.stackService.markNotHidden(this._stackId);
            }

            this.stack.is_hidden = !this.stack.is_hidden;
            this.notificationService.info("", await this.wordTranslateService.translate(this.stack.is_hidden ? "Successfully queued the stack to be marked as shown." : "Successfully queued the stack to be marked as hidden."));
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate(this.stack.is_hidden ? "An error occurred while marking this stack as shown." : "An error occurred while marking this stack as hidden."));
        }
    }

    public async updateNotifications(showSuccessNotification?: boolean) {
        try {
            if (this.stack.disable_notifications) {
                await this.stackService.enableNotifications(this._stackId);
            } else {
                await this.stackService.disableNotifications(this._stackId);
            }

            this.stack.disable_notifications = !this.stack.disable_notifications;
            if (showSuccessNotification) {
                this.notificationService.info("", await this.wordTranslateService.translate(this.stack.disable_notifications ? "Successfully enabled stack notifications." : "Successfully disabled stack notifications."));
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate(this.stack.disable_notifications ? "An error occurred while enabling stack notifications." : "An error occurred while disabling stack notifications."));
        }
    }
}

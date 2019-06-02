import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { FilterService } from "../../../service/filter.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import { EventService } from "../../../service/event.service";
import { StackService } from "../../../service/stack.service";
import { OrganizationService } from "../../../service/organization.service";
import { NotificationService } from "../../../service/notification.service";
import { $ExceptionlessClient } from "../../../exceptionlessclient";
import { formatNumber } from "@angular/common";
import { ThousandSuffixPipe } from "../../../pipes/thousand-suffix.pipe";
import { AppEventService } from "../../../service/app-event.service";
import { Organization } from "src/app/models/organization";
import { Subscription } from "rxjs";
import { TypedMessage, EntityChanged } from "src/app/models/messaging";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html"
})

export class DashboardComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[];
    public type: string;
    public  eventType: string;
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

                        $ExceptionlessClient.createFeatureUsage("app.session.Dashboard.chart.range.onSelection")
                            .setProperty("start", start)
                            .setProperty("end", end)
                            .submit();

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
            colors: ["rgba(60, 116, 0, .9)", "rgba(124, 194, 49, .7)"],
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
    private organizations: Organization[];
    public stats: any = {
        count: 0,
        unique: 0,
        new: 0,
        avg_per_hour: 0.0
    };
    public mostFrequent: any = {
        get: options => this.stackService.getFrequent(options),
        options: {
            limit: 10,
            mode: "summary"
        }
    };
    public mostRecent: any = {
        header: "Most Recent",
        get: (options) => this.eventService.getAll(options),
        options: {
            limit: 10,
            mode: "summary"
        }
    };

    constructor(
        private filterService: FilterService,
        private filterStoreService: FilterStoreService,
        private eventService: EventService,
        private stackService: StackService,
        private organizationService: OrganizationService,
        private notificationService: NotificationService,
        private thousandSuffixPipe: ThousandSuffixPipe,
        private appEvent: AppEventService,
        private activatedRoute: ActivatedRoute
    ) {
        this.subscriptions = [];
    }

    public async ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.appEvent.subscribe({
            next: (event: TypedMessage) => {
                if (event.type === "ProjectFilterChanged" || event.type === "TimeFilterChanged") {
                    this.getStats();
                }
            }
        }));

        this.subscriptions.push(this.activatedRoute.params.subscribe( (params) => {
            this.type = params.type;
            this.filterStoreService.setEventType(params.type);
        }));

        await this.get();
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private customDateSetting() {
        return true;
    }

    private async get(isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        try {
            await this.getOrganizations();
            await this.getStats();
        } catch (ex) {}
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!!message && message.type === "PersistentEvent" || message.type === "Stack") {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        if (!!message && message.type === "Organization" || message.type === "Project") {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: message.id, projectId: message.id});
        }

        return !message;
    }

    private async getOrganizations() {
        try {
            this.organizations = (await this.organizationService.getAll()).body;
        } catch (ex) {
            this.notificationService.error("", "Error Occurred!");
        }
    }

    private async getStats(isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }

        const offset = this.filterService.getTimeOffset();

        const response: any = await this.eventService.count("date:(date" + (offset ? "^" + offset : "") + " cardinality:stack sum:count~1) cardinality:stack terms:(first @include:true) sum:count~1");
        const getAggregationValue = (data, name, defaultValue) => {
            const aggs = data.aggregations;
            return aggs && aggs[name] && aggs[name].value || defaultValue;
        };

        const getAggregationItems = (data, name, defaultValue) => {
            const aggs = data.aggregations;
            return aggs && aggs[name] && aggs[name].items || defaultValue;
        };

        const results = response;
        const termsAggregation = getAggregationItems(results, "terms_first", []);
        const count = getAggregationValue(results, "sum_count", 0);
        this.stats = {
            count: count.toFixed(0),
            unique: parseInt(getAggregationValue(results, "cardinality_stack", 0), 10),
            new: parseInt(termsAggregation.length > 0 ? termsAggregation[0].total : 0, 10),
            avg_per_hour: this.eventService.calculateAveragePerHour(count, this.organizations).toFixed(1)
        };
        const dateAggregation = getAggregationItems(results, "date_date", []);

        const data1 = dateAggregation.map((item) => {
            return [moment(item.key), getAggregationValue(item, "cardinality_stack", 0)];
        });

        const data2 = dateAggregation.map((item) => {
            return [moment(item.key), getAggregationValue(item, "sum_count", 0)];
        });

        this.apexChart.seriesData = [];
        this.apexChart.seriesData.push({
            name: "Unique",
            data: data1
        });

        this.apexChart.seriesData.push({
            name: "Count",
            data: data2
        });

        this.eventType = this.type;
    }
}

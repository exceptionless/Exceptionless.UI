import { Component, OnInit, OnDestroy } from "@angular/core";
import { EventService } from "../../../service/event.service";
import { FilterService } from "../../../service/filter.service";
import { NotificationService } from "../../../service/notification.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import * as moment from "moment"; // TODO: Are we properly importing moment throughout the app.
import { Subscription } from "rxjs";
import { Organization } from "src/app/models/organization";

@Component({
    selector: "app-sessions",
    templateUrl: "./session.component.html",
    styleUrls: ["./session.component.less"]
})

export class SessionComponent implements OnInit, OnDestroy { // TODO: This should be using app-events instead of app-sessions.
    private type: string;
    public timeFilter: string; // TODO: See why these three properties are being used and passed into the component.
    public projectFilter: string;
    public eventType: string;
    private subscriptions: Subscription[];
    public includeLiveFilter: boolean = false;
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
        },
        seriesData: []
    };
    public stats = {
        total: 0,
        users: 0,
        avg_duration: null,
        avg_per_hour: 0.0
    };
    private _organizations: Organization[];
    public recentSessions = {
        get: (options) => {
            const optionsCallback = (cbOptions) => {
                if (this.includeLiveFilter) {
                    cbOptions.filter += " _missing_:data.sessionend";
                }

                return cbOptions;
            };

            return this.eventService.getAllSessions(options, optionsCallback);
        },
        summary: {
            showType: false
        },
        options: {
            limit: 10,
            mode: "summary"
        },
        hideActions: true
    };

    constructor(
        private eventService: EventService,
        private filterService: FilterService,
        private notificationService: NotificationService,
        private filterStoreService: FilterStoreService,
    ) {
        this.type = "session";
        this.filterStoreService.setEventType("session");
    }

    public async ngOnInit() { // TODO: None of these are debounced... I like this approach but this just seems bad.
        this.subscriptions = [];
        this.subscriptions.push(this.filterStoreService.getTimeFilterEmitter().subscribe(async item => {
            await this.get();
        }));
        this.subscriptions.push(this.filterStoreService.getProjectFilterEmitter().subscribe(async item => {
            await this.get();
        }));
        await this.get();
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private async get() {
        const optionsCallback = (options) => {
            options.filter += " type:session";
            if (this.includeLiveFilter) {
                options.filter += " _missing_:data.sessionend";
            }

            return options;
        };

        const offset = this.filterService.getTimeOffset();
        try {
            const response: any = await this.eventService.count("avg:value cardinality:user date:(date" + (offset ? "^" + offset : "") + " cardinality:user)", optionsCallback, false);
            const getAggregationValue = (data, name, defaultValue?) => { // TODO: We may want to create a helper utility for parsing aggregations.
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            const getAggregationItems = (data, name, defaultValue?) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            };

            this.stats = {
                total: parseInt(response.total, 10), // TODO: Seems like we need to get header values and just populate a results container from the repos.
                users: parseInt(getAggregationValue(response, "cardinality_user", 0), 0),
                avg_duration: getAggregationValue(response, "avg_value"),
                avg_per_hour: parseFloat(this.eventService.calculateAveragePerHour(response.total, this._organizations).toFixed(1))
            };

            const dateAggregation = getAggregationItems(response, "date_date", []);

            this.apexChart.seriesData = [];
            this.apexChart.seriesData.push({
                name: "Users",
                data: dateAggregation.map(item => [moment(item.key), getAggregationValue(item, "cardinality_user", 0)])
            });
            this.apexChart.seriesData.push({
                name: "Sessions",
                data: dateAggregation.map(item => [moment(item.key), item.total || 0])
            });

            this.eventType = this.type;
            this.timeFilter = this.filterStoreService.getTimeFilter();
            this.projectFilter = this.filterService.getProjectTypeId();
        } catch (ex) {
            this.notificationService.error("", "Error occurred while trying to get event service");
        }
    }

    public updateLiveFilter(isLive: boolean) {
        this.includeLiveFilter = isLive;
        this.filterService.fireFilterChanged(false);
    }
}

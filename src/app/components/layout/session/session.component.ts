import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../../service/event.service';
import { FilterService } from '../../../service/filter.service';
import { NotificationService } from '../../../service/notification.service';
import { FilterStoreService } from '../../../service/filter-store.service';
import * as moment from 'moment';

@Component({
    selector: 'app-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.less']
})

export class SessionComponent implements OnInit, OnDestroy {
    timeFilter = '';
    projectFilter = '';
    type = '';
    eventType = '';
    subscriptions: any;
    includeLiveFilter = false;
    seriesData: any[];
    apexChart: any = {
        options: {
            chart: {
                height: 200,
                type: 'area',
                stacked: true,
                events: {
                    zoomed: (chartContext, { xaxis, yaxis }) => {
                        const start = moment(xaxis.min).utc().local();
                        const end = moment(xaxis.max).utc().local();
                        this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

                        // $ExceptionlessClient.createFeatureUsage('app.session.Dashboard.chart.range.onSelection')
                        //     .setProperty('start', start)
                        //     .setProperty('end', end)
                        //     .submit();

                        return false;
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
                    }
                },
                toolbar: {
                    show: true,
                    tools: {
                        pan: false,
                    }
                }
            },
            colors: ['rgba(60, 116, 0, .9)', 'rgba(124, 194, 49, .7)'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth'
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
                position: 'top',
                horizontalAlign: 'left'
            },
            xaxis: {
                type: 'datetime'
            },
        },
        seriesData: []
    };
    stats = {
        total: 0,
        users: 0,
        avg_duration: null,
        avg_per_hour: 0.0
    };
    _organizations = [];
    recentSessions = {
        get: (options) => {
            const optionsCallback = (cbOptions) => {
                if (this.includeLiveFilter) {
                    cbOptions.filter += ' _missing_:data.sessionend';
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
            mode: 'summary'
        },
        hideActions: true
    };
    constructor(
        private eventService: EventService,
        private filterService: FilterService,
        private notificationService: NotificationService,
        private filterStoreService: FilterStoreService,
    ) {
        this.type = 'session';
        this.filterStoreService.setEventType('session');
    }

    ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.filterStoreService.getTimeFilterEmitter().subscribe(item => {
            this.get();
        }));
        this.subscriptions.push(this.filterStoreService.getProjectFilterEmitter().subscribe(item => {
            this.get();
        }));
        this.get();
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    async get() {
        const optionsCallback = (options) => {
            options.filter += ' type:session';
            if (this.includeLiveFilter) {
                options.filter += ' _missing_:data.sessionend';
            }

            return options;
        };

        const onSuccess = (response) => {
            const getAggregationValue = (data, name, defaultValue?) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            const getAggregationItems = (data, name, defaultValue?) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            };

            const results = JSON.parse(JSON.stringify(response));
            this.stats = {
                total: parseInt(results.total, 10),
                users: parseInt(getAggregationValue(results, 'cardinality_user', 0), 0),
                avg_duration: getAggregationValue(results, 'avg_value'),
                avg_per_hour: parseFloat(this.eventService.calculateAveragePerHour(results.total, this._organizations).toFixed(1))
            };

            const dateAggregation = getAggregationItems(results, 'date_date', []);

            this.apexChart.seriesData = [];
            this.apexChart.seriesData.push({
                name: 'Users',
                data: dateAggregation.map(function (item) {
                    return [moment(item.key), getAggregationValue(item, 'cardinality_user', 0)];
                })
            });
            this.apexChart.seriesData.push({
                name: 'Sessions',
                data: dateAggregation.map(function (item) {
                    return [moment(item.key), item.total || 0];
                })
            });

            this.seriesData = this.apexChart.seriesData;
            this.eventType = this.type;
            this.timeFilter = this.filterStoreService.getTimeFilter();
            this.projectFilter = this.filterService.getProjectTypeId();
        };

        const offset = this.filterService.getTimeOffset();
        try {
            const res = await this.eventService.count('avg:value cardinality:user date:(date' + (offset ? '^' + offset : '') + ' cardinality:user)', optionsCallback, false);
            onSuccess(res);
        } catch (err) {
            this.notificationService.error('', 'Error occurred while trying to get event service');
        }
    }

    updateLiveFilter(isLive) {
        this.includeLiveFilter = isLive;
        this.filterService.fireFilterChanged(false);
    }
}

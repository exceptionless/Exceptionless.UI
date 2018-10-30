import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../../service/event.service';
import { FilterService } from '../../../service/filter.service';
import { NotificationService } from '../../../service/notification.service';
import { FilterStoreService } from '../../../service/filter-store.service';
import * as moment from 'moment';
import * as Rickshaw from 'rickshaw';

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
    subscription: any;
    includeLiveFilter = false;
    seriesData: any[];
    chart = {
        options: {
            padding: {top: 0.085},
            renderer: 'stack',
            series1: [{
                name: 'Users',
                color: 'rgba(60, 116, 0, .9)',
                stroke: 'rgba(0, 0, 0, 0.15)',
                data: []
            }, {
                name: 'Sessions',
                color: 'rgba(124, 194, 49, .7)',
                stroke: 'rgba(0, 0, 0, 0.15)',
                data: []
            }],
            stroke: true,
            unstack: true
        },
        features: {
            hover: {
                render: function (args) {
                    const date = moment.unix(args.domainX);
                    const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
                    let content = '<div class="date">' + formattedDate + '</div>';
                    args.detail.sort(function (a, b) {
                        return a.order - b.order;
                    }).forEach(function (d) {
                        const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                        content += swatch + parseInt(d.formattedYValue, 10) + ' ' + d.series.name + ' <br />';
                    }, this);

                    const xLabel = document.createElement('div');
                    xLabel.className = 'x_label';
                    xLabel.innerHTML = content;
                    this.element.appendChild(xLabel);

                    // If left-alignment results in any error, try right-alignment.
                    const leftAlignError = this._calcLayoutError([xLabel]);
                    if (leftAlignError > 0) {
                        xLabel.classList.remove('left');
                        xLabel.classList.add('right');

                        // If right-alignment is worse than left alignment, switch back.
                        const rightAlignError = this._calcLayoutError([xLabel]);
                        if (rightAlignError > leftAlignError) {
                            xLabel.classList.remove('right');
                            xLabel.classList.add('left');
                        }
                    }

                    this.show();
                }
            },
            range: {
                onSelection: function (position) {
                    const start = moment.unix(position.coordMinX).utc().local();
                    const end = moment.unix(position.coordMaxX).utc().local();

                    this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

                    return false;
                }
            },
            xAxis: {
                timeFixture: new Rickshaw.Fixtures.Time.Local(),
                overrideTimeFixtureCustomFormatters: true
            },
            yAxis: {
                ticks: 5,
                tickFormat: 'formatKMBT',
                ticksTreatment: 'glow'
            }
        }
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
        this.subscription = this.filterStoreService.getTimeFilterEmitter().subscribe(item => {
            this.get();
        });
        this.filterStoreService.getProjectFilterEmitter().subscribe(item => {
            this.get();
        });
        this.get();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
            this.chart.options.series1[0]['data'] = dateAggregation.map(function (item) {
                return {x: moment(item.key).unix(), y: getAggregationValue(item, 'cardinality_user', 0), data: item};
            });

            this.chart.options.series1[1]['data'] = dateAggregation.map(function (item) {
                return {x: moment(item.key).unix(), y: item.total || 0, data: item};
            });

            this.seriesData = this.chart.options.series1;
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

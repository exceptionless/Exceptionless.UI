import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FilterService } from '../../../service/filter.service';
import { FilterStoreService } from '../../../service/filter-store.service';
import { EventService } from '../../../service/event.service';
import { StackService } from '../../../service/stack.service';
import { OrganizationService } from '../../../service/organization.service';
import { NotificationService } from '../../../service/notification.service';
import * as Rickshaw from 'rickshaw';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
    subscription: any;
    timeFilter = '';
    projectFilter = '';
    type = '';
    eventType = '';
    seriesData: any[];
    chart: any = {
        options: {
            padding: {top: 0.085},
            renderer: 'stack',
            series1: [{
                name: 'Unique',
                color: 'rgba(60, 116, 0, .9)',
                stroke: 'rgba(0, 0, 0, 0.15)',
                data: []
            }, {
                name: 'Count',
                color: 'rgba(124, 194, 49, .7)',
                stroke: 'rgba(0, 0, 0, 0.15)',
                data: []
            }],
            stroke: true,
            unstack: true,
            height: '150px'
        }
    };
    organizations: any[];
    stats: any = {
        count: 0,
        unique: 0,
        new: 0,
        avg_per_hour: 0.0
    };
    mostFrequent: any = {
        get: this.stackService.getFrequent(),
        options: {
            limit: 10,
            mode: 'summary'
        }
    };
    mostRecent: any = {
        header: 'Most Recent',
        get: (options) => {
            return this.eventService.getAll(options);
        },
        options: {
            limit: 10,
            mode: 'summary'
        }
    };
    features: any = {
        hover: {
            render: function (args) {
                const date = moment.unix(args.domainX);
                const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format('ddd, MMM D, YYYY') : date.format('ddd, MMM D, YYYY h:mma');
                let content = '<div class="date">' + formattedDate + '</div>';
                args.detail.sort(function (a, b) {
                    return a.order - b.order;
                }).forEach(function (d) {
                    const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                    content += swatch + (d.formattedYValue * 1.0).toFixed(2) + ' ' + d.series.name + ' <br />';
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
            onSelection: (position) => {
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
    };

    constructor(
        private route: ActivatedRoute,
        private filterService: FilterService,
        private filterStoreService: FilterStoreService,
        private eventService: EventService,
        private stackService: StackService,
        private organizationService: OrganizationService,
        private notificationService: NotificationService,
    ) {
        this.route.params.subscribe( (params) => {
            this.type = params['type'];
            this.filterStoreService.setEventType(this.type);
            this.get();
        });
    }

    ngOnInit() {
        this.subscription = this.filterStoreService.getTimeFilterEmitter()
            .subscribe(item => { this.get(); });

        this.filterStoreService.getProjectFilterEmitter().subscribe(item => {
            this.get();
        });
    }

    customDateSetting() {
        return true;
    }

    get(isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        this.getOrganizations().then(this.getStats.bind(this)).then(() => {
            this.timeFilter = this.filterStoreService.getTimeFilter();
            this.projectFilter = this.filterService.getProjectTypeId();
        });
    }

    canRefresh(data) {
        if (!!data && data.type === 'PersistentEvent' || data.type === 'Stack') {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
        }

        if (!!data && data.type === 'Organization' || data.type === 'Project') {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: data.id, projectId: data.id});
        }

        return !data;
    }

    async getOrganizations() {
        try {
            const response = await this.organizationService.getAll('').toPromise();
            this.organizations = JSON.parse(JSON.stringify(response.body));
            return this.organizations;
        } catch (err) {
            this.notificationService.error('', 'Error Occurred!');
            return err;
        }
    }

    async getStats() {
        const onSuccess = (response) => {
            const getAggregationValue = (data, name, defaultValue) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            };

            const getAggregationItems = (data, name, defaultValue) => {
                const aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            };

            const results = JSON.parse(JSON.stringify(response));
            const termsAggregation = getAggregationItems(results, 'terms_first', []);
            const count = getAggregationValue(results, 'sum_count', 0);
            this.stats = {
                count: count.toFixed(0),
                unique: parseInt(getAggregationValue(results, 'cardinality_stack', 0), 10),
                new: parseInt(termsAggregation.length > 0 ? termsAggregation[0].total : 0, 10),
                avg_per_hour: this.eventService.calculateAveragePerHour(count, this.organizations).toFixed(1)
            };
            const dateAggregation = getAggregationItems(results, 'date_date', []);

            this.chart.options.series1[0].data = dateAggregation.map((item) => {
                return {x: moment(item.key).unix(), y: getAggregationValue(item, 'cardinality_stack', 0), data: item};
            });

            this.chart.options.series1[1].data = dateAggregation.map((item) => {
                return {x: moment(item.key).unix(), y: getAggregationValue(item, 'sum_count', 0), data: item};
            });

            this.seriesData = this.chart.options.series1;
            this.eventType = this.type;
        };

        const offset = this.filterService.getTimeOffset();

        const res = await this.eventService.count('date:(date' + (offset ? '^' + offset : '') + ' cardinality:stack sum:count~1) cardinality:stack terms:(first @include:true) sum:count~1').toPromise();
        onSuccess(res);
        return res;
    }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FilterService } from '../../../service/filter.service';
import { FilterStoreService } from '../../../service/filter-store.service';
import { EventService } from '../../../service/event.service';
import { StackService } from '../../../service/stack.service';
import { OrganizationService } from '../../../service/organization.service';
import { NotificationService } from '../../../service/notification.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})

export class DashboardComponent implements OnInit {
    subscription: any;
    timeFilter = '';
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
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    customDateSetting() {
        return true;
    }

    get() {
        this.getOrganizations().then(() => { this.getStats().then(() => { this.timeFilter = this.filterStoreService.getTimeFilter(); }); });
    }

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('', false).subscribe(
                res => {
                    this.organizations = JSON.parse(JSON.stringify(res));
                    resolve(this.organizations);
                },
                err => {
                    this.notificationService.error('Failed', 'Error Occurred!');

                    reject(err);
                }
            );
        });
    }

    getStats() {
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
                unique: parseInt(getAggregationValue(results, 'cardinality_stack', 0)),
                new: parseInt(termsAggregation.length > 0 ? termsAggregation[0].total : 0),
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

        return new Promise((resolve, reject) => {
            this.eventService.count('date:(date' + (offset ? '^' + offset : '') + ' cardinality:stack sum:count~1) cardinality:stack terms:(first @include:true) sum:count~1').subscribe(
                res => {
                    onSuccess(res);
                    resolve(res);
                },
                err => {
                    reject(err);
                }
            );
        });
    }
}

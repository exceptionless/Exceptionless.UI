import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { FilterService } from '../../../service/filter.service';
import { FilterStoreService } from '../../../service/filter-store.service';
import { EventService } from '../../../service/event.service';
import { StackService } from '../../../service/stack.service';
import { OrganizationService } from '../../../service/organization.service';
import { NotificationService } from '../../../service/notification.service';
import { $ExceptionlessClient } from '../../../exceptionlessclient';

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

                        $ExceptionlessClient.createFeatureUsage('app.session.Dashboard.chart.range.onSelection')
                            .setProperty('start', start)
                            .setProperty('end', end)
                            .submit();

                        return false;
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
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

            const projectType = params['project_type'];
            const queryId = params['id'];
            if (projectType === 'project') {
                this.filterService.setProjectId(queryId, true);
                this.filterService.setEventType('project', true);
            } else if (projectType === 'organization') {
                this.filterService.setOrganizationId(queryId, true);
                this.filterService.setEventType('organization', true);
            }

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

     async get(isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        try {
            await this.getOrganizations();
            await this.getStats();
            this.timeFilter = this.filterStoreService.getTimeFilter();
            this.projectFilter = this.filterService.getProjectTypeId();
        } catch (err) {}
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
            const response = await this.organizationService.getAll('');
            this.organizations = JSON.parse(JSON.stringify(response['body']));
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

            const data1 = dateAggregation.map((item) => {
                return [moment(item.key), getAggregationValue(item, 'cardinality_stack', 0)];
            });

            const data2 = dateAggregation.map((item) => {
                return [moment(item.key), getAggregationValue(item, 'sum_count', 0)];
            });

            this.apexChart.seriesData = [];

            this.apexChart.seriesData.push({
                name: 'Unique',
                data: data1
            });

            this.apexChart.seriesData.push({
                name: 'Count',
                data: data2
            });
            this.eventType = this.type;
        };

        const offset = this.filterService.getTimeOffset();

        const res = await this.eventService.count('date:(date' + (offset ? '^' + offset : '') + ' cardinality:stack sum:count~1) cardinality:stack terms:(first @include:true) sum:count~1');
        onSuccess(res);
        return res;
    }
}

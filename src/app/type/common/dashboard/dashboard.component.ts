import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from "moment";
import { FilterService } from "../../../service/filter.service"
import { EventService } from "../../../service/event.service"
import { OrganizationService } from "../../../service/organization.service"
import { NotificationService } from "../../../service/notification.service"
import * as rickshaw from 'rickshaw';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})

export class DashboardComponent implements OnInit {
    type: string = '';
    chart: any = {
        options: {
            padding: {top: 0.085},
            renderer: 'stack',
            series: [{
                name: 'Unique',
                color: 'rgba(60, 116, 0, .9)',
                stroke: 'rgba(0, 0, 0, 0.15)'
            }, {
                name: 'Count',
                color: 'rgba(124, 194, 49, .7)',
                stroke: 'rgba(0, 0, 0, 0.15)'
            }],
            stroke: true,
            unstack: true
        },
        features: {
            hover: {
                render: function (args) {
                    let date = moment.unix(args.domainX);
                    let dateTimeFormat = 'DateTimeFormat';
                    let dateFormat = 'DateFormat';
                    let formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format(dateFormat || 'ddd, MMM D, YYYY') : date.format(dateTimeFormat || 'ddd, MMM D, YYYY h:mma');
                    let content = '<div class="date">' + formattedDate + '</div>';
                    args.detail.sort(function (a, b) {
                        return a.order - b.order;
                    }).forEach(function (d) {
                        let swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                        content += swatch + d.formattedYValue.toFixed(2) + ' ' + d.series.name + ' <br />';
                    }, this);

                    let xLabel = document.createElement('div');
                    xLabel.className = 'x_label';
                    xLabel.innerHTML = content;
                    this.element.appendChild(xLabel);

                    // If left-alignment results in any error, try right-alignment.
                    let leftAlignError = this._calcLayoutError([xLabel]);
                    if (leftAlignError > 0) {
                        xLabel.classList.remove('left');
                        xLabel.classList.add('right');

                        // If right-alignment is worse than left alignment, switch back.
                        let rightAlignError = this._calcLayoutError([xLabel]);
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
                    let start = moment.unix(position.coordMinX).utc().local();
                    let end = moment.unix(position.coordMaxX).utc().local();
                    this.filterService.setTime(start.format('YYYY-MM-DDTHH:mm:ss') + '-' + end.format('YYYY-MM-DDTHH:mm:ss'));

                    return false;
                }
            },
            xAxis: {
                timeFixture: rickshaw.Fixtures.Time.Local(),
                overrideTimeFixtureCustomFormatters: true
            },
            yAxis: {
                ticks: 5,
                tickFormat: 'formatKMBT',
                ticksTreatment: 'glow'
            }
        }
    };
    organizations: any[];
    stats: Object;

    constructor(
        private route: ActivatedRoute,
        private filterService: FilterService,
        private eventService: EventService,
        private organizationService: OrganizationService,
        private notificationService: NotificationService
    ) {
        this.route.params.subscribe( (params) => { this.type = params['type']; } );
    }

    ngOnInit() {
        this.get();
    }

    get() {
        this.getOrganizations().then(() => {this.getStats();});
    };

    getOrganizations() {
        return new Promise((resolve, reject) => {
            this.organizationService.getAll('',false).subscribe(
                res=> {
                    this.organizations = JSON.parse(JSON.stringify(res));

                    resolve(this.organizations);
                },
                err=>{
                    this.notificationService.error('Error Occurred!', 'Failed');

                    reject(err);
                },
                () => console.log('Organization Service called!')
            );
        });
    };

    getStats() {
        let onSuccess = (response) => {
            function getAggregationValue(data, name, defaultValue) {
                let aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].value || defaultValue;
            }

            function getAggregationItems(data, name, defaultValue) {
                let aggs = data.aggregations;
                return aggs && aggs[name] && aggs[name].items || defaultValue;
            }

            let results = JSON.parse(JSON.stringify(response));
            let termsAggregation = getAggregationItems(results, 'terms_first', []);
            let count = getAggregationValue(results, 'sum_count', 0);
            this.stats = {
                count: count.toFixed(1),
                unique: parseInt(getAggregationValue(results, 'cardinality_stack', 0)),
                new: parseInt(termsAggregation.length > 0 ? termsAggregation[0].total : 0, 0),
                avg_per_hour: this.eventService.calculateAveragePerHour(count, this.organizations).toFixed(2)
            };

            let dateAggregation = getAggregationItems(results, 'date_date', []);
            let convertedObj = JSON.parse(JSON.stringify(this.chart));

            console.log("converted obj = ", convertedObj.options);

            convertedObj.options.series[0].data = dateAggregation.map((item) => {
                return {x: moment(item.key).unix(), y: getAggregationValue(item, 'cardinality_stack', 0), data: item};
            });

            convertedObj.options.series[1].data = dateAggregation.map((item) => {
                return {x: moment(item.key).unix(), y: getAggregationValue(item, 'sum_count', 0), data: item};
            });

            this.chart = convertedObj;
        };

        let offset = this.filterService.getTimeOffset();

        return new Promise((resolve, reject) => {
            this.eventService.count('date:(date' + (offset ? '^' + offset : '') + ' cardinality:stack sum:count~1) cardinality:stack terms:(first @include:true) sum:count~1').subscribe(
                res=> {
                    onSuccess(res);
                },
                err=>{
                    reject(err);
                },
                () => console.log('Event Service called!')
            );
        });
    };
}

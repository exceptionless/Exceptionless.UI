import { Component, OnInit, ViewChild, Input, ElementRef, SimpleChanges } from '@angular/core';
import * as Rickshaw from 'rickshaw';
import * as moment from 'moment';

@Component({
    selector: 'app-rickshaw',
    templateUrl: './rickshaw.component.html',
    styleUrls: ['./rickshaw.component.less']
})

export class RickshawComponent implements OnInit {
    @Input() options;
    @Input() seriesData;
    graph: any;
    features: any;

    @ViewChild('widgetrickshaw') graphElement: ElementRef;

    constructor() {
        this.features =  {
            hover: {
                render: function (args) {
                    const date = moment.unix(args.domainX);
                    const dateTimeFormat = 'DateTimeFormat';
                    const dateFormat = 'DateFormat';
                    const formattedDate = date.hours() === 0 && date.minutes() === 0 ? date.format(dateFormat || 'ddd, MMM D, YYYY') : date.format(dateTimeFormat || 'ddd, MMM D, YYYY h:mma');
                    let content = '<div class="date">' + formattedDate + '</div>';
                    args.detail.sort(function (a, b) {
                        return a.order - b.order;
                    }).forEach(function (d) {
                        const swatch = '<span class="detail-swatch" style="background-color: ' + d.series.color.replace('0.5', '1') + '"></span>';
                        content += swatch + d.formattedYValue.toFixed(2) + ' ' + d.series.name + ' <br />';
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
        };
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.graphElement) {
            this.graphElement.nativeElement.innerHTML = '';
            this.graph = new Rickshaw.Graph({
                element: this.graphElement.nativeElement,
                series: this.options.series1,
                options: this.options,
                features: this.features
            });

            this.graph.render();

            /*if (this.features && this.features.hover) {
                let config = {
                    graph: this.graph,
                    xFormatter: this.features.hover.xFormatter,
                    yFormatter: this.features.hover.yFormatter,
                    formatter: this.features.hover.formatter,
                    onRender: this.features.hover.onRender
                };

                let Hover = this.features.hover.render ? Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {render: this.features.hover.render}) : Rickshaw.Graph.HoverDetail;
                let hoverDetail = new Hover(config);
            }

            if (this.features && this.features.palette) {
                let palette = new Rickshaw.Color.Palette({scheme: this.features.palette});
                for (let i = 0; i < this.options.series1.length; i++) {
                    this.options.series1[i].color = palette.color();
                }
            }

            if (this.features && this.features.range) {
                let rangeSelector = new Rickshaw.Graph.RangeSelector({
                    graph: this.graph,
                    selectionCallback: this.features.range.onSelection
                });
            }

            this.graph.render();*/

            if (this.features && this.features.xAxis) {
                const xAxisConfig = {
                    graph: this.graph
                };

                if (this.features.xAxis.element) {
                    xAxisConfig['element'] = this.features.xAxis.element;
                }

                if (this.features.xAxis.orientation) {
                    xAxisConfig['orientation'] = this.features.xAxis.orientation;
                }

                if (this.features.xAxis.pixelsPerTick) {
                    xAxisConfig['pixelsPerTick'] = this.features.xAxis.pixelsPerTick;
                }

                const timeFixture = this.features.xAxis.timeFixture;
                if (timeFixture) {
                    if (this.features.xAxis.overrideTimeFixtureCustomFormatters) {
                        timeFixture.units[2].formatter = function(date) { return moment(date).format('MMM'); }; // month
                        timeFixture.units[3].formatter = function(date) { return moment(date).format('MMM D'); }; // week
                        timeFixture.units[4].formatter = function(date) { return moment(date).format('MMM D'); }; // day
                        timeFixture.units[5].formatter = function(date) { return moment(date).format('ha'); }; // 6 hours
                        timeFixture.units[6].formatter = function(date) { return moment(date).format('h:mma'); }; // hour
                        timeFixture.units[7].formatter = function(date) { return moment(date).format('h:mma'); }; // 15 minute
                        timeFixture.units[8].formatter = function(date) { return moment(date).format('h:mma'); }; // minute
                        timeFixture.units[8].formatter = function(date) { return moment(date).format('h:mma'); }; // second
                        timeFixture.units[8].formatter = function(date) { return moment(date).format('h:mma'); }; // decisecond
                        timeFixture.units[8].formatter = function(date) { return moment(date).format('h:mma'); }; // centisecond
                    }

                    xAxisConfig['timeFixture'] = timeFixture;
                }

                if (this.features.xAxis.timeUnit) {
                    const time = new Rickshaw.Fixtures.Time();
                    xAxisConfig['timeUnit'] = time.unit(this.features.xAxis.timeUnit);
                }

                if (this.features.xAxis.ticks) {
                    xAxisConfig['ticks'] = this.features.xAxis.ticks;
                }

                if (this.features.xAxis.tickValues) {
                    xAxisConfig['tickValues'] = this.features.xAxis.tickValues;
                }

                if (this.features.xAxis.tickSize) {
                    xAxisConfig['tickSize'] = this.features.xAxis.tickSize;
                }

                if (this.features.xAxis.ticksTreatment) {
                    xAxisConfig['ticksTreatment'] = this.features.xAxis.ticksTreatment;
                }

                const useStandardXAxis = xAxisConfig['orientation'] || xAxisConfig['pixelsPerTick'] || xAxisConfig['ticks'] || xAxisConfig['tickValues'] || xAxisConfig['tickSize'] || xAxisConfig['element'];
                const xAxis = useStandardXAxis ? new Rickshaw.Graph.Axis.X(xAxisConfig) : new Rickshaw.Graph.Axis.Time(xAxisConfig);

                xAxis.render();
            }

            if (this.features && this.features.yAxis) {
                const yAxisConfig = {
                    graph: this.graph
                };

                if (this.features.yAxis.element) {
                    yAxisConfig['element'] = this.features.yAxis.element;
                }

                if (this.features.yAxis.orientation) {
                    yAxisConfig['orientation'] = this.features.yAxis.orientation;
                }

                if (this.features.yAxis.pixelsPerTick) {
                    yAxisConfig['pixelsPerTick'] = this.features.yAxis.pixelsPerTick;
                }

                if (this.features.yAxis.ticks) {
                    yAxisConfig['ticks'] = this.features.yAxis.ticks;
                }

                if (this.features.yAxis.tickValues) {
                    yAxisConfig['tickValues'] = this.features.yAxis.tickValues;
                }

                if (this.features.yAxis.tickSize) {
                    yAxisConfig['tickSize'] = this.features.yAxis.tickSize;
                }

                if (this.features.yAxis.ticksTreatment) {
                    yAxisConfig['ticksTreatment'] = this.features.yAxis.ticksTreatment;
                }

                if (this.features.yAxis.tickFormat) {
                    yAxisConfig['tickFormat'] = Rickshaw.Fixtures.Number[this.features.yAxis.tickFormat];
                }

                const yAxis = new Rickshaw.Graph.Axis.Y(yAxisConfig);
                yAxis.render();
            }
        }
    }

    ngOnInit() {
    }
}

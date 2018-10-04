import { Component, OnChanges, ViewChild, Input, ElementRef, SimpleChanges } from '@angular/core';
import * as Rickshaw from 'rickshaw';
import * as d3 from 'd3';
import * as moment from 'moment';
import {FilterService} from '../../service/filter.service';

@Component({
    selector: 'app-rickshaw',
    templateUrl: './rickshaw.component.html'
})

export class RickshawComponent implements OnChanges {
    @Input() options;
    @Input() seriesData;
    @Input() eventType;
    @Input() filterTime;
    @Input() projectFilter;
    @Input() inputFeatures;
    @Input() features;
    graph: any;
    @ViewChild('widgetrickshaw') graphElement: ElementRef;

    constructor(private filterService: FilterService) {
        Rickshaw.namespace('Rickshaw.Graph.RangeSelector');
        Rickshaw.Graph.RangeSelector = Rickshaw.Class.create({
            initialize: function (args) {
                const element = this.element = args.element;
                const graph = this.graph = args.graph;
                graph._selectionCallback = args.selectionCallback;
                const position = this.position = {};
                const startPointerX = 0;
                const selectorDiv = document.createElement('div');
                selectorDiv.className = 'rickshaw_range_selector';
                const selectionBox = this.selectionBox = selectorDiv;
                const loaderDiv = document.createElement('div');
                loaderDiv.className = 'rickshaw_range_selector_loader';
                const loader = loaderDiv;
                graph.element.insertBefore(selectionBox, graph.element.firstChild);
                graph.element.insertBefore(loader, graph.element.firstChild);
                this._addListeners();
                graph.onUpdate(function () {
                    this.update();
                }.bind(this));
            },
            _addListeners: function () {
                const graph = this.graph;
                const position = this.position;
                let _startPointerX = this.startPointerX;
                const selectionBox = this.selectionBox;
                let selectionControl = false;
                const selectionDraw = function (startPointX) {
                    graph.element.addEventListener('mousemove', function (event) {
                        if (selectionControl) {
                            event.stopPropagation();
                            let deltaX;
                            position.x = event.layerX;
                            deltaX = Math.max(position.x, startPointX) - Math.min(position.x, startPointX);
                            position.minX = Math.min(position.x, startPointX);
                            position.maxX = position.minX + deltaX;

                            // style of selectionBox
                            selectionBox.style.transition = 'none';
                            selectionBox.style.opacity = 1;
                            selectionBox.style.width = deltaX + 'px';
                            selectionBox.style.height = '100%';
                            selectionBox.style.left = position.minX + 'px';
                            selectionBox.style.top = 0;
                        } else {
                            return false;
                        }
                    }, false);
                };
                graph.element.addEventListener('mousedown', function (event) {
                    event.stopPropagation();
                    const startPointX = this.startPointX = event.layerX;

                    // style of selectionBox
                    selectionBox.style.left = event.layerX + 'px';
                    selectionBox.style.height = '100%';
                    selectionBox.style.width = 0;

                    selectionControl = true;
                    selectionDraw(startPointX);
                }, true);
                document.body.addEventListener('keyup', function (event) {
                    if (!selectionControl) {
                        return;
                    }
                    event.stopPropagation();
                    if (event.keyCode !== 27) {
                        return;
                    }
                    selectionControl = false;

                    // style of selectionBox
                    selectionBox.style.transition = 'opacity 0.2s ease-out';
                    selectionBox.style.opacity = 0;
                    selectionBox.style.width = 0;
                    selectionBox.style.height = 0;
                }, true);
                document.body.addEventListener('mouseup', function (event) {
                    if (!selectionControl) {
                        return;
                    }
                    selectionControl = false;
                    position.coordMinX = Math.round(graph.x.invert(position.minX));
                    position.coordMaxX = Math.round(graph.x.invert(position.maxX));

                    // style of selectionBox
                    selectionBox.style.transition = 'opacity 0.2s ease-out';
                    selectionBox.style.width = 0;
                    selectionBox.style.height = 0;
                    selectionBox.style.opacity = 0;

                    if (graph._selectionCallback && !isNaN(position.coordMinX) && !isNaN(position.coordMaxX) &&
                        _startPointerX !== event.layerX && // Ensure that there was an actual selection.
                        position.coordMinX !== position.coordMaxX && // Ensure that there was an actual selection.
                        event.button === 0) { // Only accept left mouse button up..
                        graph._selectionCallback(position);
                    }

                    _startPointerX = 0;
                }, false);
            },
            update: function () {
                const graph = this.graph;
                const position = this.position;

                if (graph.window.xMin === null) {
                    position.coordMinX = graph.dataDomain()[0];
                }

                if (graph.window.xMax === null) {
                    position.coordMaxX = graph.dataDomain()[1];
                }
            }
        });

        Rickshaw.namespace('Rickshaw.Graph.Renderer.DottedLine');
        Rickshaw.Graph.Renderer.DottedLine = Rickshaw.Class.create(Rickshaw.Graph.Renderer.Line, {
            name: 'dotted_line',
            _styleSeries: function(series) {
                const result = Rickshaw.Graph.Renderer.Line.prototype._styleSeries.call(this, series);
                d3.select(series.path).style('stroke-dasharray', '3, 2');
                return result;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.graphElement) {
            this.graphElement.nativeElement.firstChild.innerHTML = '';
            const newElement = this.graphElement.nativeElement.firstChild.cloneNode();
            this.graphElement.nativeElement.innerHTML = '';
            this.graphElement.nativeElement.append(newElement);
            this.graph = new Rickshaw.Graph({
                element: this.graphElement.nativeElement.firstChild,
                series: this.options.series1,
                options: this.options,
                features: this.inputFeatures || this.features,
                unstack: true
            });

            this.graph.render();

            if (this.features && this.features.hover) {
                const config = {
                    graph: this.graph,
                    xFormatter: this.features.hover.xFormatter,
                    yFormatter: this.features.hover.yFormatter,
                    formatter: this.features.hover.formatter,
                    onRender: this.features.hover.onRender
                };

                const Hover = this.features.hover.render ? Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {render: this.features.hover.render}) : Rickshaw.Graph.HoverDetail;
                const hoverDetail = new Hover(config);
            }

            if (this.features && this.features.palette) {
                const palette = new Rickshaw.Color.Palette({scheme: this.features.palette});
                for (let i = 0; i < this.options.series1.length; i++) {
                    this.options.series1[i].color = palette.color();
                }
            }

            if (this.features && this.features.range) {
                const rangeSelector = new Rickshaw.Graph.RangeSelector({
                    graph: this.graph,
                    selectionCallback: this.features.range.onSelection
                });
            }

            this.graph.render();

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
}

import {Component, Input, OnInit, SimpleChanges, OnChanges} from '@angular/core';

@Component({
    selector: 'app-apexchart',
    templateUrl: './apexchart.component.html',
    styleUrls: ['./apexchart.component.less']
})
export class ApexchartComponent implements OnInit, OnChanges {

    @Input() options;
    @Input() seriesData;
    @Input() updatedOptions;

    chart: any;

    constructor() {
    }

    ngOnInit() {
        this.chart = new ApexCharts(document.querySelector('#apexchart'), this.options);
        this.chart.render();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.chart) {
            if (changes.seriesData) {
                this.chart.updateSeries(changes.seriesData.currentValue);
            }
            if (changes.updatedOptions) {
                this.chart.updateOptions(changes.updatedOptions.currentValue);
            }
        }
    }
}

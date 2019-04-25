import {Component, Input, OnInit, SimpleChanges, OnChanges} from "@angular/core";
import { ApexOptions } from "apexcharts";

@Component({
    selector: "app-apexchart",
    templateUrl: "./apexchart.component.html",
    styleUrls: ["./apexchart.component.less"]
})
export class ApexchartComponent implements OnInit, OnChanges {
    @Input() options: ApexOptions;
    @Input() seriesData: ApexAxisChartSeries;
    @Input() updatedOptions: ApexOptions;

    private _chart: ApexCharts;

    constructor() {
    }

    public async ngOnInit() {
        this._chart = new ApexCharts(document.querySelector("#apexchart"), this.options);
        await this._chart.render();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this._chart) {
            if (changes.seriesData) {
                this._chart.updateSeries(changes.seriesData.currentValue);
            }
            if (changes.updatedOptions) {
                this._chart.updateOptions(changes.updatedOptions.currentValue);
            }
        }
    }
}

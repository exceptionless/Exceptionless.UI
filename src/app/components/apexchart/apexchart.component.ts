import {Component, Input, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef} from "@angular/core";
import { ApexOptions } from "apexcharts";

declare var ApexCharts;

@Component({
    selector: "app-apexchart",
    templateUrl: "./apexchart.component.html",
    styleUrls: ["./apexchart.component.scss"]
})
export class ApexchartComponent implements OnInit, OnChanges {
    private _chart: ApexCharts;

    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;

    @Input() options: ApexOptions;
    @Input() seriesData: any; // ApexAxisChartSeries ?;
    @Input() updatedOptions: ApexOptions;

    ngOnInit(): void {
        this._chart = new ApexCharts(this.chartContainer.nativeElement, this.options);
        this._chart.render();
    }

    ngOnChanges(changes: SimpleChanges): void {
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

import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-summary",
    templateUrl: "./summary.component.html",
    styleUrls: ["./summary.component.less"],
})

export class SummaryComponent implements OnInit {
    @Input() public source: any; // TODO: Create this model.. comes from api with parameter mode=summary.
    @Input() public showType: boolean;

    public isLevelSuccess: boolean;
    public isLevelInfo: boolean;
    public isLevelWarning: boolean;
    public isLevelError: boolean;

    constructor() {}

    public ngOnInit() {
        const level =  this.source && this.source.data && this.source.data.Level ? this.source.data.Level.toLowerCase() : null;
        this.isLevelSuccess = level === "trace" || level === "debug";
        this.isLevelInfo = level === "info";
        this.isLevelWarning = level === "warn";
        this.isLevelError = level === "error";
    }
}

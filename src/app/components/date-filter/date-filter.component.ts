import { Component, OnInit, ViewContainerRef } from "@angular/core";
import * as moment from "moment";
import { FilterService } from "../../service/filter.service";
import { DateRangeParserService } from "../../service/date-range-parser.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { FilterStoreService } from "../../service/filter-store.service";
import { DialogService } from "../../service/dialog.service";

@Component({
    selector: "app-date-filter",
    templateUrl: "./date-filter.component.html",
    styleUrls: ["./date-filter.component.less"]
})

export class DateFilterComponent implements OnInit {
    public filteredDisplayName: string = "Last Hour";

    constructor(
        private viewRef: ViewContainerRef,
        private filterService: FilterService,
        private filterStoreService: FilterStoreService,
        private dateRangeParserService: DateRangeParserService,
        private wordTranslateService: WordTranslateService,
        private dialogService: DialogService
    ) {}

    public ngOnInit() {
        this.updateFilterDisplayName();
        this.filterStoreService.getTimeFilterEmitter()
            .subscribe(item => { this.updateFilterDisplayName(); });
    }

    public getFilteredDisplayName(): string {
        const time = this.filterStoreService.getTimeFilter();

        if (time === "last hour") {
            return "Last Hour";
        }

        if (time === "last 24 hours") {
            return "Last 24 Hours";
        }

        if (time === "last week") {
            return "Last Week";
        }

        if (time === "last 30 days") {
            return "Last 30 Days";
        }

        if (time === "all") {
            return "All Time";
        }

        const range = this.dateRangeParserService.parse(time);

        if (range && range.start && range.end) {
            return moment(range.start).format("MMM DD, hh:ss A") + " - " + moment(range.end).format("MMM DD, hh:ss A");
        }

        this.setFilter("last week");

        return "Last Week";
    }

    public setFilter(filter) {
        this.filterService.setTime(filter);
        this.updateFilterDisplayName();
    }

    public async setCustomFilter() {
        await this.dialogService.customFilter(this.viewRef, () => this.customDateSetting());
    }

    private customDateSetting() {
        this.filteredDisplayName = this.getFilteredDisplayName();
        return true;
    }

    public updateFilterDisplayName() {
        this.filteredDisplayName = this.getFilteredDisplayName();
    }

    public isActive(timeRangeName: string): boolean {
        const time = this.filterStoreService.getTimeFilter();
        if (time && timeRangeName === "Custom") {
            const range = this.dateRangeParserService.parse(time);
            return range && !!range.start && !!range.end;
        }

        return timeRangeName === time;
    }
}

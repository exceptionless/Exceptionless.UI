import { Component, OnInit, ViewContainerRef } from '@angular/core';
import * as moment from 'moment';
import { FilterService } from '../../service/filter.service';
import { DateRangeParserService } from '../../service/date-range-parser.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { FilterStoreService } from '../../service/filter-store.service';
import { DialogService } from '../../service/dialog.service';

@Component({
    selector: 'app-date-filter',
    templateUrl: './date-filter.component.html',
    styleUrls: ['./date-filter.component.less']
})

export class DateFilterComponent implements OnInit {
    filteredDisplayName = 'Last Hour';

    constructor(
        private viewRef: ViewContainerRef,
        private filterService: FilterService,
        private filterStoreService: FilterStoreService,
        private dateRangeParserService: DateRangeParserService,
        private wordTranslateService: WordTranslateService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.updateFilterDisplayName();
        this.filterStoreService.getTimeFilterEmitter()
            .subscribe(item => { this.updateFilterDisplayName(); });
    }

    getFilteredDisplayName() {
        const time = this.filterStoreService.getTimeFilter();

        console.log('get-filtered-display-name:', time);

        if (time === 'last hour') {
            return 'Last Hour';
        }

        if (time === 'last 24 hours') {
            return 'Last 24 Hours';
        }

        if (time === 'last week') {
            return 'Last Week';
        }

        if (time === 'last 30 days') {
            return 'Last 30 Days';
        }

        if (time === 'all') {
            return 'All Time';
        }

        const range = this.dateRangeParserService.parse(time);

        if (range && range.start && range.end) {
            return moment(range.start).format('MMM DD, hh:ss A') + ' - ' + moment(range.end).format('MMM DD, hh:ss A');
        }

        this.setFilter('last week');

        return 'Last Week';
    }

    setFilter(filter) {
        this.filterService.setTime(filter);
        this.updateFilterDisplayName();
    }

    setCustomFilter() {
        this.dialogService.customFilter(this.viewRef, this.customDateSetting());
        // this.modalDialogService.openDialog(this.viewRef, {
        //     title: 'Select Date Range',
        //     childComponent: CustomDateRangeDialogComponent,
        //     actionButtons: [
        //         { text: 'Cancel', buttonClass: 'btn btn-default', onAction: () => true },
        //         { text: 'Apply', buttonClass: 'btn btn-primary', onAction: () => this.customDateSetting() }
        //     ]
        // });
    }

    customDateSetting() {
        this.filteredDisplayName = this.getFilteredDisplayName();
        return true;
    }

    updateFilterDisplayName() {
        console.log('update-filter-display-name');
        this.filteredDisplayName = this.getFilteredDisplayName();
    }

    isActive(timeRangeName) {
        const time = this.filterStoreService.getTimeFilter();
        if (time && timeRangeName === 'Custom') {
            const range = this.dateRangeParserService.parse(time);
            return range && range.start && range.end;
        }

        return timeRangeName === time;
    }
}

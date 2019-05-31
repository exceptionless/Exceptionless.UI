import { Component, ComponentRef, AfterViewInit, ViewChild } from "@angular/core";
import { IModalDialog, IModalDialogOptions } from "ngx-modal-dialog";
import * as moment from "moment";
import { FilterService } from "../../service/filter.service";
import { DateRangeParserService } from "../../service/date-range-parser.service";
import { DaterangePickerComponent } from "ng2-daterangepicker";
import { FilterStoreService } from "../../service/filter-store.service";

@Component({
    selector: "app-custom-date-range-dialog",
    templateUrl: "./custom-date-range-dialog.component.html"
})

export class CustomDateRangeDialogComponent implements IModalDialog, AfterViewInit {
    @ViewChild(DaterangePickerComponent, { static: false })
    private picker: DaterangePickerComponent;

    // TODO: Typings?
    public options: any = {
        locale: { format: "MM/DD/YYYY" },
        alwaysShowCalendars: false,
    };

    public daterange: any = {};

    constructor(
        private filterService: FilterService,
        private dateRangeParserService: DateRangeParserService,
        private filterStoreService: FilterStoreService
    ) {
    }

    public ngAfterViewInit() {
        const time = this.filterStoreService.getTimeFilter();
        const range = this.dateRangeParserService.parse(time);

        if (range && range.start && range.end) {
            this.picker.datePicker.setStartDate(new Date(range.start));
            this.picker.datePicker.setEndDate(new Date(range.end));
        }
    }

    public selectedDate(value: any, datepicker?: any) {
        // any object can be passed to the selected event and it will be passed back here
        datepicker.start = value.start;
        datepicker.end = value.end;

        const confirmedFilterDate = value.start.format("YYYY-MM-DDTHH:mm:ss") + "-" + value.end.format("YYYY-MM-DDTHH:mm:ss");
        this.filterService.setTime(confirmedFilterDate);

        // or manupulat your own internal property
        this.daterange.start = value.start;
        this.daterange.end = value.end;
        this.daterange.label = value.label;
    }

    public  dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }
}

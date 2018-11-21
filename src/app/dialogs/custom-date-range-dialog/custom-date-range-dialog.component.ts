import { Component, ComponentRef, AfterViewInit, ViewChild } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import * as moment from 'moment';
import { FilterService } from '../../service/filter.service';
import { DateRangeParserService } from '../../service/date-range-parser.service';
import { DaterangePickerComponent } from 'ng2-daterangepicker';

@Component({
    selector: 'app-custom-date-range-dialog',
    templateUrl: './custom-date-range-dialog.component.html'
})

export class CustomDateRangeDialogComponent implements IModalDialog, AfterViewInit {
    daterangepickerOptions: any;

    @ViewChild(DaterangePickerComponent)
    private picker: DaterangePickerComponent;

    public options: any = {
        locale: { format: 'MM/DD/YYYY' },
        alwaysShowCalendars: false,
    };

    public daterange: any = {};

    constructor(
        private filterService: FilterService,
        private dateRangeParserService: DateRangeParserService
    ) {

        this.daterangepickerOptions = {
            startDate: null,
            endDate: null,
            format: 'MM/DD/YYYY HH:mm:ss A',
            minDate: moment(new Date(2018, 1, 1)),
            maxDate: moment(),
            inactiveBeforeStart: true,
            autoApply: true,
            showRanges: true,
            singleCalendar: false,
            displayFormat: 'MM/DD/YYYY HH:mm:ss A',
            position: 'left',
            disabled: false,
            noDefaultRangeSelected: false,
            timePicker: {
                minuteInterval: 5
            },
            preDefinedRanges: [],
            disableBeforeStart: true
        };

    }

    ngAfterViewInit() {
        const time = this.filterService.getTime();
        const range = this.dateRangeParserService.parse(time);

        if (range && range.start && range.end) {
            console.log(range);
            console.log(this.picker);
            this.picker.datePicker.setStartDate(new Date(range.start));
            this.picker.datePicker.setEndDate(new Date(range.end));
        }
    }

    rangeSelected(date: any) {
        const confirmedFilterDate = date.start.format('YYYY-MM-DDTHH:mm:ss') + '-' + date.end.format('YYYY-MM-DDTHH:mm:ss');

        this.filterService.setTime(confirmedFilterDate);
    }

    public selectedDate(value: any, datepicker?: any) {
        // this is the date the iser selected
        console.log(value);

        // any object can be passed to the selected event and it will be passed back here
        datepicker.start = value.start;
        datepicker.end = value.end;

        const confirmedFilterDate = value.start.format('YYYY-MM-DDTHH:mm:ss') + '-' + value.end.format('YYYY-MM-DDTHH:mm:ss');
        this.filterService.setTime(confirmedFilterDate);

        // or manupulat your own internal property
        this.daterange.start = value.start;
        this.daterange.end = value.end;
        this.daterange.label = value.label;
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }
}

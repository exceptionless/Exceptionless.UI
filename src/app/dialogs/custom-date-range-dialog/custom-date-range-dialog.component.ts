import { Component, ComponentRef, OnInit } from '@angular/core';
import { IModalDialog, IModalDialogOptions } from 'ngx-modal-dialog';
import * as moment from 'moment';
import { FilterService } from '../../service/filter.service';

@Component({
    selector: 'app-custom-date-range-dialog',
    templateUrl: './custom-date-range-dialog.component.html'
})

export class CustomDateRangeDialogComponent implements IModalDialog {
    daterangepickerOptions = {
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

    public options: any = {
        locale: { format: 'MM/DD/YYYY' },
        alwaysShowCalendars: false,
    };

    public daterange: any = {};

    constructor(
        private filterService: FilterService
    ) {}

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

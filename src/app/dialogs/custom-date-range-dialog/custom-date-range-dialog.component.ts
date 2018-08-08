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
    constructor(
        private filterService: FilterService
    ) {}

    rangeSelected(date: any) {
        const confirmedFilterDate = date.start.format('YYYY-MM-DDTHH:mm:ss') + '-' + date.end.format('YYYY-MM-DDTHH:mm:ss');

        this.filterService.setTime(confirmedFilterDate);
    }

    dialogInit(reference: ComponentRef<IModalDialog>, options: Partial<IModalDialogOptions<any>>) {
        // no processing needed
    }
}

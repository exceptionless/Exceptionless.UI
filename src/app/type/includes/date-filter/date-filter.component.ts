import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-date-filter',
    templateUrl: './date-filter.component.html',
    styleUrls: ['./date-filter.component.less']
})
export class DateFilterComponent implements OnInit {
    opened: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    toggleOpen() {
        this.opened = !this.opened
    }
}

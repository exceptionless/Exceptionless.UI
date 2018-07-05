import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-timeago',
    templateUrl: './timeago.component.html',
    styleUrls: ['./timeago.component.less']
})
export class TimeagoComponent implements OnInit {
    @Input() date;
    text = '';

    constructor() {
    }

    ngOnInit() {
        this.setTimeagoText();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setTimeagoText();
    }

    setTimeagoText() {
        const dateInstance = moment(this.date);
        this.text = (!!this.date && dateInstance.isValid() && dateInstance.year() > 1) ? dateInstance.fromNow() : 'never';
    }
}

import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-timeago',
    templateUrl: './timeago.component.html'
})

export class TimeagoComponent implements OnInit, OnChanges {
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

import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-timeago',
    templateUrl: './timeago.component.html',
    styleUrls: ['./timeago.component.less']
})
export class TimeagoComponent implements OnInit {
    @Input() date;
    text: any = '';


    constructor() {
    }

    ngOnInit() {
        this.setTimeagoText();
    }

    setTimeagoText() {
        let dateInstance = moment(this.date);
        this.date = (!!this.date && dateInstance.isValid() && dateInstance.year() > 1) ? dateInstance.fromNow() : 'never';
    };
}

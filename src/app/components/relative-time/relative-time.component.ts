import {Component, OnInit, Input} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-relative-time',
    templateUrl: './relative-time.component.html'
})

export class RelativeTimeComponent implements OnInit {
    @Input() date;
    @Input() to;
    text: any = '';

    constructor() {}

    ngOnInit() {
        this.setRelativeTimeText();
    }

    setRelativeTimeText() {
        const to = moment(this.to);
        const date = moment(this.date);
        const isValid = !!this.to && to.isValid() && to.year() > 1 && !!this.date && date.isValid() && date.year() > 1;
        this.text = isValid ? date.to(to, true) : 'never';
    }
}

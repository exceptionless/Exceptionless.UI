import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-duration',
    templateUrl: './duration.component.html',
    host: {'class': 'app-component'}
})
export class DurationComponent implements OnInit, OnChanges {
    @Input() value;
    @Input() period;
    text = '';

    constructor() {
    }

    ngOnInit() {
        this.setDurationText();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setDurationText();
    }

    setDurationText() {
        if (typeof(this.value) === 'number') {
            const duration = moment.duration(this.value, this.period || 'seconds');
            this.text = duration.humanize();
        } else {
            this.text = 'never';
        }
    }
}

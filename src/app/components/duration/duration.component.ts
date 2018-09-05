import { Component, OnInit, OnChanges, Input, SimpleChanges, HostBinding } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-duration',
    templateUrl: './duration.component.html'
})
export class DurationComponent implements OnInit, OnChanges {
    @HostBinding('class.app-component') appComponent = true;
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

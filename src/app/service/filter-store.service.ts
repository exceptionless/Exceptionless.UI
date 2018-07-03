import { Injectable, EventEmitter } from '@angular/core';
import { Locker, DRIVERS } from 'angular-safeguard';

@Injectable({
    providedIn: 'root'
})

export class FilterStoreService {
    timeFilterEventFire: EventEmitter<any> = new EventEmitter();
    constructor(
        private locker: Locker,
    ) {
        this.locker.setDriverFallback(DRIVERS.LOCAL);
        this.locker.setNamespace('filter');
    }

    getTimeFilter() {
        return this.locker.get(DRIVERS.LOCAL, 'time');
    }

    setTimeFilter(timeFilter) {
        this.locker.set(DRIVERS.LOCAL, 'time', timeFilter);
        this.timeFilterEventFire.emit(this.getTimeFilter());
    }

    getTimeFilterEmitter() {
        return this.timeFilterEventFire;
    }

    getEventType() {
        return this.locker.get(DRIVERS.LOCAL, 'type');
    }

    setEventType(type) {
        this.locker.set(DRIVERS.LOCAL, 'type', type);
    }
}

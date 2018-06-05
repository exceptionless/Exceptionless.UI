import { Injectable } from '@angular/core';
import { Locker, DRIVERS } from 'angular-safeguard'

@Injectable({
    providedIn: 'root'
})

export class FilterStoreService {
    constructor(
        private locker: Locker,
    ) {

        this.locker.setDriverFallback(DRIVERS.LOCAL);
        this.locker.setNamespace('filter');
    }

    getTimeFilter() {
        return this.locker.get(DRIVERS.LOCAL,'time');
    };

    setTimeFilter(timeFilter) {
        this.locker.set(DRIVERS.LOCAL,'time', timeFilter);
    };
}

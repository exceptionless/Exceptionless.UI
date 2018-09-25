import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NextObserver } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

@Injectable({
    providedIn: 'root'
})
export class AppEventService {

    eventEmitter = new Subject();

    constructor() {
    }

    subscribe(observer: NextObserver<any>): Subscription {
        return this.eventEmitter.subscribe(observer);
    }

    fireEvent(event: any) {
        this.eventEmitter.next(event);
    }

}

import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AppEventService } from '../service/app-event.service';
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '[appRefreshOn]'
})
export class RefreshOnDirective implements OnInit, OnDestroy {

    @Input() refreshOn: any;
    @Input() refreshThrottle: any;
    @Input() refreshDebounce: any;
    @Output() refreshAction = new EventEmitter<any>();
    subscriptions: Subscription[] = [];
    lastRunTime: any;

    constructor(private appEvent: AppEventService) {
    }

    ngOnInit() {
        // let action = () => { this.refreshAction.emit(); };
        // if (this.refreshDebounce) {
        //     action = debounce(action, this.refreshDebounce || 1000, {isImmediate: true});
        // } else if (this.refreshThrottle) {
        //     action = _.throttle(action, this.refreshThrottle || 1000);
        // }
        this.lastRunTime = {};
        const throttleTime = (this.refreshThrottle || 1000) * 2;

        if (this.refreshOn) {
            this.refreshOn.split(' ').forEach(key => {
                this.subscriptions.push(this.appEvent.subscribe({
                    next: (event: any) => {
                        if (event.type === key) {
                            const tt = new Date().getTime();
                            if (this.lastRunTime[key]) {
                                if (tt - this.lastRunTime[key] < throttleTime) {
                                    return;
                                }
                            }
                            console.log('last-time:', this.lastRunTime[key]);
                            console.log('current-time:', tt);
                            console.log('duration:', (tt - this.lastRunTime[key]) / 1000);
                            console.log('run-event:', event);
                            this.lastRunTime[key] = tt;
                            this.refreshAction.emit(event.value);
                        }
                    }
                }));
            });
        }
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

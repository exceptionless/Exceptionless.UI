import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { AppEventService, AppEvent } from "../service/app-event.service";
import { Subscription } from "rxjs/Subscription";

@Directive({
    selector: "[appRefreshOn]"
})
export class RefreshOnDirective implements OnInit, OnDestroy {
    // TODO: Add Refresh Action, search code for canRefresh and add typing..
    @Input() public refreshOn: string;
    @Input() public refreshThrottle: any;
    @Input() public refreshDebounce: any;
    @Output() public refreshAction = new EventEmitter<string> ();
    private subscriptions: Subscription[] = [];
    private lastRunTime: { [id: string]: number };

    constructor(private appEvent: AppEventService) {
    }

    ngOnInit() {
        // TODO: This should be using lodash for throttling or debounceing.
        // let action = () => { this.refreshAction.emit(); };
        // if (this.refreshDebounce) {
        //     action = debounce(action, this.refreshDebounce || 1000, {isImmediate: true});
        // } else if (this.refreshThrottle) {
        //     action = throttle(action, this.refreshThrottle || 1000);
        // }
        this.lastRunTime = {};
        const throttleTime = (this.refreshThrottle || 10000) * 1;

        if (this.refreshOn) {
            this.refreshOn.split(" ").forEach(key => {
                this.subscriptions.push(this.appEvent.subscribe({
                    next: (event: AppEvent) => {
                        if (event.type === key) {
                            const tt = new Date().getTime();
                            if (this.lastRunTime[key]) {
                                if (tt - this.lastRunTime[key] < throttleTime) {
                                    return;
                                }
                            }
                            // console.log('last-time:', this.lastRunTime[key]);
                            // console.log('current-time:', tt);
                            // console.log('duration:', (tt - this.lastRunTime[key]) / 1000);
                            // console.log('run-event:', event);
                            this.lastRunTime[key] = tt;
                            this.refreshAction.emit(event);
                        }
                    }
                }));
            });
        }
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

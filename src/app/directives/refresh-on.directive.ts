import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AppEventService } from '../service/app-event.service';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { debounce } from 'ts-debounce';

@Directive({
    selector: '[appRefreshOn]'
})
export class RefreshOnDirective implements OnInit, OnDestroy {

    @Input() refreshOn: any;
    @Input() refreshThrottle: any;
    @Input() refreshDebounce: any;
    @Output() refreshAction = new EventEmitter<any>();
    subscriptions: Subscription[] = [];

    constructor(private appEvent: AppEventService) {
    }

    ngOnInit() {
        // let action = () => { this.refreshAction.emit(); };
        // if (this.refreshDebounce) {
        //     action = debounce(action, this.refreshDebounce || 1000, {isImmediate: true});
        // } else if (this.refreshThrottle) {
        //     action = _.throttle(action, this.refreshThrottle || 1000);
        // }

        if (this.refreshOn) {
            this.refreshOn.split(' ').forEach(key => {
                this.subscriptions.push(this.appEvent.subscribe({
                    next: (event: any) => {
                        this.refreshAction.emit(event.value);
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

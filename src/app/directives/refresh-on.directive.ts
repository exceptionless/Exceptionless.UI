import { Directive, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AppEventService } from '../service/app-event.service';
import { Subscription } from 'rxjs/Subscription';

@Directive({
    selector: '[appRefreshOn]'
})
export class RefreshOnDirective implements OnInit, OnDestroy {

    @Input() refreshOn: any;
    @Output() refreshAction = new EventEmitter<any>();
    subscriptions: Subscription[] = [];

    constructor(private appEvent: AppEventService) {
    }

    ngOnInit() {
        this.refreshOn.split(' ').forEach(key => {
            this.subscriptions.push(this.appEvent.subscribe({
                next: (event: any) => {
                    this.refreshAction.emit(event.value);
                }
            }));
        });
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StackService } from '../../../service/stack.service';
import { FilterStoreService } from '../../../service/filter-store.service';

@Component({
    selector: 'app-frequent',
    templateUrl: './frequent.component.html'
})

export class FrequentComponent implements OnInit, OnDestroy {
    timeFilter = '';
    projectFilter = '';
    mostFrequent: any = {
        get: this.stackService.getFrequent,
        options: {
            limit: 20,
            mode: 'summary'
        }
    };
    subscriptions: any;

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {
    }

    ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.route.params.subscribe( (params) => { this.filterStoreService.setEventType(params['type']); }));
        this.subscriptions.push(this.filterStoreService.getTimeFilterEmitter().subscribe(item => { this.timeFilter = item; }));
        this.subscriptions.push(this.filterStoreService.getProjectFilterEmitter().subscribe(item => { this.projectFilter = item['id']; }));
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

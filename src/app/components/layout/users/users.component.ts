import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterStoreService } from '../../../service/filter-store.service';
import { StackService } from '../../../service/stack.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html'
})

export class UsersComponent implements OnInit, OnDestroy {
    type = '';
    timeFilter = '';
    projectFilter = '';
    mostUsers: any = {
        get: this.stackService.getUsers,
        options: {
            limit: 20,
            mode: 'summary'
        },
    };
    subscriptions: any;

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {}

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

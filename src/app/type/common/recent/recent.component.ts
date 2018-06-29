import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterStoreService } from '../../../service/filter-store.service';
import { EventService } from '../../../service/event.service';

@Component({
    selector: 'app-recent',
    templateUrl: './recent.component.html',
    styleUrls: ['./recent.component.less']
})

export class RecentComponent implements OnInit {
    mostRecent: any = {
        get: this.eventService.getAll,
        options: {
            limit: 20,
            mode: 'summary'
        },
    };

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private eventService: EventService
    ) {
        this.route.params.subscribe( (params) => { this.filterStoreService.setEventType(params['type']); });
    }

    ngOnInit() {
    }

}

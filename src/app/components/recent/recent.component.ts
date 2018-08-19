import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterStoreService } from '../../service/filter-store.service';
import { EventService } from '../../service/event.service';

@Component({
    selector: 'app-recent',
    templateUrl: './recent.component.html'
})

export class RecentComponent implements OnInit {
    timeFilter = '';
    projectFilter = '';
    mostRecent: any = {
        get: (options) => {
            return this.eventService.getAll(options);
        },
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
        this.filterStoreService.getTimeFilterEmitter().subscribe(item => { this.timeFilter = item; });
        this.filterStoreService.getProjectFilterEmitter().subscribe(item => { this.projectFilter = item['id']; });
    }

}

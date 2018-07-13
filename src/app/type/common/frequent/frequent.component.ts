import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StackService } from '../../../service/stack.service';
import { FilterStoreService } from '../../../service/filter-store.service';

@Component({
    selector: 'app-frequent',
    templateUrl: './frequent.component.html',
    styleUrls: ['./frequent.component.less']
})
export class FrequentComponent implements OnInit {
    timeFilter = '';
    projectFilter = '';
    mostFrequent: any = {
        get: this.stackService.getFrequent,
        options: {
            limit: 20,
            mode: 'summary'
        }
    };

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {
        this.route.params.subscribe( (params) => { this.filterStoreService.setEventType(params['type']); });
    }

    ngOnInit() {
        this.filterStoreService.getTimeFilterEmitter().subscribe(item => { this.timeFilter = item; });
        this.filterStoreService.getProjectFilterEmitter().subscribe(item => { this.projectFilter = item['id']; });
    }

}

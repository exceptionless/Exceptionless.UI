import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StackService } from '../../../service/stack.service';
import { FilterStoreService } from '../../../service/filter-store.service';

@Component({
    selector: 'app-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.less']
})
export class NewComponent implements OnInit {
    subscription: any;
    timeFilter = '';
    newest: any = {
        get: this.stackService.getNew,
        options: {
            limit: 20,
            mode: 'summary'
        },
    };

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {
        this.route.params.subscribe( (params) => { this.filterStoreService.setEventType(params['type']); });
    }

    ngOnInit() {
        this.subscription = this.filterStoreService.getTimeFilterEmitter()
            .subscribe(item => { this.timeFilter = item; });
    }
}

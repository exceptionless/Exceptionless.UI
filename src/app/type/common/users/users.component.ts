import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterStoreService } from '../../../service/filter-store.service';
import { StackService } from '../../../service/stack.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less']
})
export class UsersComponent implements OnInit {
    type = '';
    mostUsers: any = {
        get: this.stackService.getUsers,
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
    }

}

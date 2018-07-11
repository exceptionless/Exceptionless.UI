import { Component, OnInit } from '@angular/core';
import { FilterService } from '../../../service/filter.service';
import { FilterStoreService } from '../../../service/filter-store.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    types = {
        exceptions: 'error',
        log: 'log',
        broken: '404',
        feature: 'usage',
        events: 'events'
    };
    actions = {
        list: 'list',
        edit: 'edit'
    };
    projectType = '';
    projectId = '';
    filterUrlPattern = '';

    constructor(
        private filterStoreService: FilterStoreService,
        private filterService: FilterService
    ) {
    }

    ngOnInit() {
        this.filterStoreService.getProjectFilterEmitter().subscribe(item => {
            this.setFilterUrlPattern();
        });
        this.setFilterUrlPattern();
    }

    setFilterUrlPattern() {
        if (this.filterService.getProjectType() === 'All Projects') {
            this.filterUrlPattern = '';
        } else {
            this.projectId = this.filterService.getProjectTypeId();
            this.projectType = this.filterService.getProjectType();
            this.filterUrlPattern = `${this.projectType}/${this.projectId}/`;
        }
    }
}

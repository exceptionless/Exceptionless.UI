import { Component, OnInit } from '@angular/core';
import { FilterService } from '../../service/filter.service';

@Component({
    selector: 'app-search-filter',
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.less']
})

export class SearchFilterComponent implements OnInit {

    filter: any = '';

    constructor(private filterService: FilterService) {
    }

    ngOnInit() {
    }

    updateFilter() {
        this.filter = this.filterService.getFilter();
    }

    setSearchFilter(filter) {
        this.filterService.setFilter(filter);
    }

}

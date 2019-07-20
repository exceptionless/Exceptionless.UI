import { Component, OnInit } from "@angular/core";
import { FilterService } from "../../service/filter.service";

@Component({
    selector: "app-search-filter",
    templateUrl: "./search-filter.component.html",
    styleUrls: ["./search-filter.component.less"]
})

export class SearchFilterComponent {
    public filter: string;

    constructor(private filterService: FilterService) {
    }

    public updateFilter() {
        this.filter = this.filterService.getFilter();
    }

    public setSearchFilter(filter) {
        this.filterService.setFilter(filter);
    }
}

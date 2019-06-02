import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StackService } from "../../../service/stack.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-frequent",
    templateUrl: "./frequent.component.html"
})

export class FrequentComponent implements OnInit, OnDestroy {
    public timeFilter: string;
    public projectFilter: string;
    public mostFrequent: any = {
        get: options => this.stackService.getFrequent(options),
        options: {
            limit: 20,
            mode: "summary"
        }
    };
    private subscriptions: Subscription[];

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {
    }

    public ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.route.params.subscribe( (params) => { this.filterStoreService.setEventType(params.type); }));
        this.subscriptions.push(this.filterStoreService.getTimeFilterEmitter().subscribe(item => { this.timeFilter = item; }));
        this.subscriptions.push(this.filterStoreService.getProjectFilterEmitter().subscribe(item => { this.projectFilter = item.id; }));
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

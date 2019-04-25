import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FilterStoreService } from "../../../service/filter-store.service";
import { EventService } from "../../../service/event.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-recent",
    templateUrl: "./recent.component.html"
})

export class RecentComponent implements OnInit, OnDestroy {
    public timeFilter: string;
    public projectFilter: string;
    public mostRecent: any = {
        get: (options) => {
            return this.eventService.getAll(options);
        },
        options: {
            limit: 20,
            mode: "summary"
        },
    };
    private subscriptions: Subscription[];

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private eventService: EventService
    ) {}

    public ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.route.params.subscribe(params => this.filterStoreService.setEventType(params.type)));
        this.subscriptions.push(this.filterStoreService.getTimeFilterEmitter().subscribe(item => this.timeFilter = item));
        this.subscriptions.push(this.filterStoreService.getProjectFilterEmitter().subscribe(item => this.projectFilter = item.id));
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }
}

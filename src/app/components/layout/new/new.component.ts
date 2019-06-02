import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StackService } from "../../../service/stack.service";
import { FilterStoreService } from "../../../service/filter-store.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-new",
    templateUrl: "./new.component.html"
})

export class NewComponent implements OnInit, OnDestroy {
    public timeFilter: string;
    public projectFilter: string;
    public newest: any = {
        get: options => this.stackService.getNew(options),
        options: {
            limit: 20,
            mode: "summary"
        },
    };
    private subscriptions: Subscription[];

    constructor(
        private route: ActivatedRoute,
        private filterStoreService: FilterStoreService,
        private stackService: StackService
    ) {}

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

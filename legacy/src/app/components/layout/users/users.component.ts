import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FilterStoreService } from "../../../service/filter-store.service";
import { StackService } from "../../../service/stack.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html"
})

export class UsersComponent implements OnInit, OnDestroy {
    public timeFilter = "";
    public projectFilter = ""; // TODO: I don't know why time filter and project filter are passed here. this should be coming from the filter service.
    public mostUsers: any = {
        get: options => this.stackService.getUsers(options),
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

import { Component, Input, OnChanges, SimpleChanges, HostBinding, ViewContainerRef, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { FilterService } from "../../service/filter.service";
import { EventsActionService, EventAction } from "../../service/events-action.service";
import { NotificationService } from "../../service/notification.service";
import { LinkService } from "../../service/link.service";
import { PaginationService } from "../../service/pagination.service";
import { WordTranslateService } from "../../service/word-translate.service";
import { AppEventService } from "../../service/app-event.service";
import { PersistentEvent } from "src/app/models/event";
import { Subscription } from "rxjs";
import { TypedMessage, EntityChanged, ChangeType } from "src/app/models/messaging";
import { GetEventParameters as GetEventsParameters } from "src/app/service/event.service";

export interface EventsSettings {
    relativeTo: Date;
    hideActions?: boolean;
    hideSessionStartTime?: boolean;
    sortByDateDescending?: boolean;
    summary?: { showType: boolean };
    timeHeaderText?: string;
    options?: GetEventsParameters;
    get: (options?: GetEventsParameters) => Promise<PersistentEvent[]>;
}

@Component({
    selector: "app-events",
    templateUrl: "./events.component.html"
})

export class EventsComponent implements OnChanges, OnInit, OnDestroy {
    @HostBinding("class.app-component") appComponent: boolean = true;
    @Input() private settings: EventsSettings;
    @Input() private eventType: string; // TODO: never used
    @Input() private currentEvent: PersistentEvent;
    @Input() private filterTime: string; // TODO: never used
    @Input() private projectFilter: string; // TODO: never used
    public next: GetEventsParameters;
    public previous: GetEventsParameters;
    public events: PersistentEvent[];
    public actions: EventAction[];
    public selectedIds: string[];
    public pageSummary: string;
    public loading: boolean = true;
    public showType: boolean;
    public sortByDateDescending: boolean;
    public timeHeaderText: string;
    public hideSessionStartTime: boolean;
    private subscriptions: Subscription[];
    public currentOptions: GetEventsParameters = {};

    constructor(
        private router: Router,
        private filterService: FilterService,
        private eventsActionService: EventsActionService,
        private notificationService: NotificationService,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private wordTranslateService: WordTranslateService,
        private viewRef: ViewContainerRef,
        private appEvent: AppEventService
    ) {}

    public async ngOnChanges(changes: SimpleChanges) {
        this.sortByDateDescending = this.settings.sortByDateDescending === undefined ? true : this.sortByDateDescending;
        this.timeHeaderText = this.settings.timeHeaderText || "Date";
        this.hideSessionStartTime = this.settings.hideSessionStartTime || false;
        this.actions = this.settings.hideActions ? [] : this.eventsActionService.getActions();
        this.showType = this.settings.summary ? this.settings.summary.showType : !this.filterService.getEventType();
        await this.get();
    }

    public ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.appEvent.subscribe({
            next: async (message: TypedMessage) => {
                if (message.type === "ProjectFilterChanged" || message.type === "TimeFilterChanged") { // TODO: We need to investigate this because I don't think time filter changed is ever fired on this bus.
                    await this.get();
                }
            }
        }));
    }

    public ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!!message && message.type === "PersistentEvent") {
            // We are already listening to the stack changed event... This prevents a double refresh.
            if (message.change_type !== ChangeType.Removed) {
                return false;
            }

            // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
            if (!!message.id && !!this.events) {
                return this.events.filter(e => e.id === message.id).length > 0;
            }

            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        if (!!message && message.type === "Stack") {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: message.organization_id, projectId: message.project_id });
        }

        if (!!message && message.type === "Organization" || message.type === "Project") {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: message.id, projectId: message.id});
        }

        return !message;
    }

    async get(options?: GetEventsParameters, isRefresh?: boolean) {
        if (isRefresh && !this.canRefresh(isRefresh)) { // TODO: This is messed up, refresh is only ever supposed to take an entity changed type.
            return;
        }

        const onSuccess = async (response, link) => {
            this.events = response

            if (this.selectedIds) {
                this.selectedIds = this.selectedIds.filter(id => {
                    return this.events.filter(e => e.id === id).length > 0;
                });
            }

            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links.previous;
            this.next = links.next;

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions.page, this.currentOptions.limit);

            if (this.events.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        };
        this.loading = true;
        this.currentOptions = options || this.settings.options;

        if (!this.currentEvent || (this.currentEvent && this.currentEvent.project_id)) {
            try {
                const res: Response = await this.settings.get(this.currentOptions, this.currentEvent).toPromise();
                onSuccess(res.body, res.headers.get("link"));
                return this.events;
            } catch (ex) {
                this.notificationService.error("", "Error Occurred!");
            } finally {
                this.loading = false;
            }
        }
    }

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }

    public open(id: string, event: MouseEvent) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/event/${id}`, "_blank");
        } else {
            this.router.navigate([`/event/${id}`]);
        }

        event.preventDefault();
    }

    async save(action) {
        const onSuccess = () => {
            this.selectedIds = [];
            this.get();
        };

        if (this.selectedIds.length === 0) {
            this.notificationService.info("", await this.wordTranslateService.translate("Please select one or more stacks"));
        } else {
            action.run(this.selectedIds, this.viewRef, onSuccess);
        }
    }

    updateSelection() {
        if (this.events && this.events.length === 0) {
            return;
        }

        if (this.selectedIds.length > 0) {
            this.selectedIds = [];
        } else {
            this.selectedIds = this.events.map(event => event.id);
        }
    }

    relativeTo(): Date {
        return this.settings.relativeTo;
    }
}

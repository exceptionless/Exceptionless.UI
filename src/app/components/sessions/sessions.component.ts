import { Component, Input, OnChanges, SimpleChanges, HostBinding } from "@angular/core";
import { Router } from "@angular/router";
import { LinkService } from "../../service/link.service";
import { FilterService } from "../../service/filter.service";
import { PaginationService } from "../../service/pagination.service";
import { NotificationService } from "../../service/notification.service";
import { WordTranslateService } from "../../service/word-translate.service";
import * as moment from "moment";
import { PersistentEvent } from "src/app/models/event";
import { EntityChanged, ChangeType } from "src/app/models/messaging";

@Component({
    selector: "app-sessions-replace-me-with-app-events",
    templateUrl: "./sessions.component.html"
})

export class SessionsComponent implements OnChanges { // TODO: THIS SHOULD HAVE NEVER BEEN CREATED. What ever is using this should be using the EventsComponents
    @HostBinding("class.app-component") appComponent = true;
    @Input() settings;
    @Input() eventType;
    @Input() filterTime;
    @Input() projectFilter;
    next: string;
    previous: string;
    pageSummary: string;
    currentOptions: any = {};
    loading = true;
    showType: boolean;
    events: PersistentEvent[] = [];
    constructor(
        private router: Router,
        private filterService: FilterService,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private notificationService: NotificationService,
        private wordTranslateService: WordTranslateService
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        this.showType = this.settings.summary ? this.settings.showType : !this.filterService.getEventType();
        this.get();
    }

    public canRefresh(message: EntityChanged) { // TODO: This needs to be hooked up to the can refresh.
        if (!!message && message.type === "PersistentEvent") {
            // We are already listening to the stack changed event... This prevents a double refresh.
            if (message.change_type !== ChangeType.removed) {
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

    private async get(options?: any, isRefresh?: boolean) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }

        this.loading = true;
        this.currentOptions = options || this.settings.options;

        try {
            this.events = await this.settings.get(this.currentOptions).toPromise();
            const links = this.linkService.getLinksQueryParameters(response.headers.get("link"));
            this.previous = links.previous;
            this.next = links.next;

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions.page, this.currentOptions.limit);

            if (this.events.length === 0 && this.currentOptions.page && this.currentOptions.page > 1) {
                return await this.get();
            }
        } catch (ex) {
            this.notificationService.error("", await this.wordTranslateService.translate("Error Occurred!"));
        } finally {
            this.loading = false;
        }
    }

    public getDuration(ev: PersistentEvent): number {
        // TODO: this binding expression can be optimized.
        if (ev.message.SessionEnd) {
            return ev.message.Value || 0;
        }

        return moment().diff(ev.date, "seconds");
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

    public async nextPage() {
        await this.get(this.next);
    }

    public async previousPage() {
        await this.get(this.previous);
    }

    public hasFilter() {
        return this.filterService.hasFilter();
    }
}

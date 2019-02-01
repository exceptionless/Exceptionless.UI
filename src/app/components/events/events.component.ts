import { Component, Input, OnChanges, SimpleChanges, HostBinding, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FilterService } from '../../service/filter.service';
import { EventsActionService } from '../../service/events-action.service';
import { NotificationService } from '../../service/notification.service';
import { LinkService } from '../../service/link.service';
import { PaginationService } from '../../service/pagination.service';
import { WordTranslateService } from '../../service/word-translate.service';
import { AppEventService } from '../../service/app-event.service';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html'
})

export class EventsComponent implements OnChanges, OnInit, OnDestroy {
    @HostBinding('class.app-component') appComponent = true;
    @Input() settings;
    @Input() eventType;
    @Input() currentEvent;
    @Input() filterTime;
    @Input() projectFilter;
    next: string;
    previous: string;
    events: any[] = [];
    actions: any[];
    selectedIds: any[] = [];
    pageSummary: string;
    currentOptions = {};
    loading = true;
    showType: any;
    sortByDateDescending: any;
    timeHeaderText: string;
    hideSessionStartTime: boolean;
    subscriptions: any;
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

    ngOnChanges(changes: SimpleChanges) {
        this.sortByDateDescending = this.settings['sortByDateDescending'] === undefined ? true : this.sortByDateDescending;
        this.timeHeaderText = this.settings['timeHeaderText'] || 'Date';
        this.hideSessionStartTime = this.settings['hideSessionStartTime'] || false;
        this.actions = this.settings['hideActions'] ? [] : this.eventsActionService.getActions();
        this.showType = this.settings['summary'] ? this.settings['summary']['showType'] : !this.filterService.getEventType();
        this.get();
    }

    ngOnInit() {
        this.subscriptions = [];
        this.subscriptions.push(this.appEvent.subscribe({
            next: (event: any) => {
                if (event.type === 'ProjectFilterChanged' || event.type === 'TimeFilterChanged') {
                    this.get();
                }
            }
        }));
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    canRefresh(data) {
        if (!!data && data.type === 'PersistentEvent') {
            // We are already listening to the stack changed event... This prevents a double refresh.
            if (!data.deleted) {
                return false;
            }

            // Refresh if the event id is set (non bulk) and the deleted event matches one of the events.
            if (!!data.id && !!this.events) {
                return this.events.filter(function (e) { return e.id === data.id; }).length > 0;
            }

            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
        }

        if (!!data && data.type === 'Stack') {
            return this.filterService.includedInProjectOrOrganizationFilter({ organizationId: data.organization_id, projectId: data.project_id });
        }

        if (!!data && data.type === 'Organization' || data.type === 'Project') {
            return this.filterService.includedInProjectOrOrganizationFilter({organizationId: data.id, projectId: data.id});
        }

        return !data;
    }

    async get(options?, isRefresh?) {
        if (isRefresh && !this.canRefresh(isRefresh)) {
            return;
        }
        const onSuccess = (response, link) => {
            this.events = JSON.parse(JSON.stringify(response));

            if (this.selectedIds) {
                this.selectedIds = this.selectedIds.filter((id) => {
                    return this.events.filter(function (e) {
                        return e.id === id;
                    }).length > 0;
                });
            }

            const links = this.linkService.getLinksQueryParameters(link);
            this.previous = links['previous'];
            this.next = links['next'];

            this.pageSummary = this.paginationService.getCurrentPageSummary(response, this.currentOptions['page'], this.currentOptions['limit']);

            if (this.events.length === 0 && this.currentOptions['page'] && this.currentOptions['page'] > 1) {
                return this.get();
            }

            return this.events;
        };
        this.loading = true;
        this.currentOptions = options || this.settings.options;

        if (!this.currentEvent || (this.currentEvent && this.currentEvent.project_id)) {
            try {
                const res: Response = await this.settings.get(this.currentOptions, this.currentEvent).toPromise();
                onSuccess(res.body, res.headers.get('link'));
                this.loading = false;
                return this.events;
            } catch (err) {
                this.loading = false;
                this.notificationService.error('', 'Error Occurred!');
                return err;
            }
        }
    }

    nextPage() {
        return this.get(this.next);
    }

    previousPage() {
        return this.get(this.previous);
    }

    open(id, event) {
        const openInNewTab = (event.ctrlKey || event.metaKey || event.which === 2);
        if (openInNewTab) {
            window.open(`/event/${id}`, '_blank');
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
            this.notificationService.info('', await this.wordTranslateService.translate('Please select one or more stacks'));
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
            this.selectedIds = this.events.map(function (event) {
                return event.id;
            });
        }
    }

    relativeTo() {
        return this.settings['relativeTo'];
    }
}

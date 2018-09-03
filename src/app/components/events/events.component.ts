import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { FilterService } from '../../service/filter.service';
import { EventsActionService } from '../../service/events-action.service';
import { NotificationService } from '../../service/notification.service';
import { LinkService } from '../../service/link.service';
import { PaginationService } from '../../service/pagination.service';
import { WordTranslateService } from '../../service/word-translate.service';

@Component({
    selector: 'app-events',
    templateUrl: './events.component.html',
    host: {'class': 'app-component'}
})

export class EventsComponent implements OnChanges {
    @Input() settings;
    @Input() eventType;
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
    constructor(
        private router: Router,
        private filterService: FilterService,
        private eventsActionService: EventsActionService,
        private notificationService: NotificationService,
        private linkService: LinkService,
        private paginationService: PaginationService,
        private wordTranslateService: WordTranslateService
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        this.sortByDateDescending = this.settings['sortByDateDescending'] === undefined ? true : this.sortByDateDescending;
        this.timeHeaderText = this.settings['timeHeaderText'] || 'Date';
        this.hideSessionStartTime = this.settings['hideSessionStartTime'] || false;
        this.actions = this.settings['hideActions'] ? [] : this.eventsActionService.getActions();
        this.showType = this.settings['summary'] ? this.settings['summary']['showType'] : !this.filterService.getEventType();
        this.get();
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

    get(options?) {
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
        this.events = [];
        this.currentOptions = options || this.settings.options;

        return new Promise((resolve, reject) => {
            this.settings.get(this.currentOptions).subscribe(
                res => {
                    onSuccess(res.body, res.headers.get('link'));
                    this.loading = false;
                    resolve(this.events);
                },
                err => {
                    this.loading = false;
                    this.notificationService.error('', 'Error Occurred!');
                    reject(err);
                }
            );
        });
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
        };

        if (this.selectedIds.length === 0) {
            this.notificationService.info('', await this.wordTranslateService.translate('Please select one or more stacks'));
        } else {
            /*this.action.run(this.selectedIds).then(onSuccess());*/
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

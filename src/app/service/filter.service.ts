import { Injectable } from '@angular/core';
import { FilterStoreService } from './filter-store.service';
import { DateRangeParserService } from './date-range-parser.service';
import { ObjectIdService } from './object-id.service';
import * as moment from 'moment';

@Injectable()
export class FilterService {
    DEFAULT_TIME_FILTER = 'last week';
    _time: any;
    _eventType = '';
    _organizationId = '';
    _projectId = '';
    _raw = '';

    constructor(
        private filterStoreService: FilterStoreService,
        private dateRangeParserService: DateRangeParserService,
        private objectIdService: ObjectIdService,
    ) {
        this._time = this.filterStoreService.getTimeFilter() || this.DEFAULT_TIME_FILTER;
        this._eventType = this.filterStoreService.getEventType() || null;
    }

    apply(source, includeHiddenAndFixedFilter?) {
        return Object.assign({}, this.getDefaultOptions(includeHiddenAndFixedFilter), source);
    }

    buildFilter(includeHiddenAndFixedFilter) {
        includeHiddenAndFixedFilter = (typeof includeHiddenAndFixedFilter !== 'undefined') ?  includeHiddenAndFixedFilter : true;
        const filters: any[] = [];

        if (this._organizationId) {
            filters.push('organization:' + this._organizationId);
        }

        if (this._projectId) {
            filters.push('project:' + this._projectId);
        }

        if (this._eventType && this.filterStoreService.getEventType() !== 'events') {
            filters.push('type:' + this.filterStoreService.getEventType());
        }

        const filter = this._raw || '';
        const isWildCardFilter = filter.trim() === '*';

        if (includeHiddenAndFixedFilter && !isWildCardFilter) {
            const hasFixed = filter.search(/\bfixed:/i) !== -1;
            if (!hasFixed) {
                filters.push('fixed:false');
            }

            const hasHidden = filter.search(/\bhidden:/i) !== -1;
            if (!hasHidden) {
                filters.push('hidden:false');
            }
        }

        if (!!filter && !isWildCardFilter) {
            filters.push('(' + filter + ')');
        }

        return filters.join(' ').trim();
    }

    clearFilter() {
        if (!this._raw) {
            return;
        }

        this.setFilter(null, false);
        this.fireFilterChanged();
    }

    clearOrganizationAndProjectFilter() {
        if (!this._organizationId && !this._projectId) {
            return;
        }

        this._organizationId = this._projectId = null;
        this.fireFilterChanged();
    }

    fireFilterChanged(includeHiddenAndFixedFilter?) {
        const options = {
            organization_id: this._organizationId,
            project_id: this._projectId,
            type: this._eventType
        };

        // $rootScope.$emit('filterChanged', angular.extend(options, getDefaultOptions(includeHiddenAndFixedFilter)));
    }

    getDefaultOptions(includeHiddenAndFixedFilter) {
        const options = {};

        const offset = this.getTimeOffset();
        if (offset) {
            Object.assign(options, { offset: offset });
        }

        const filter = this.buildFilter(includeHiddenAndFixedFilter);
        if (filter) {
            Object.assign(options, { filter: filter });
        }

        if (!!this._time && this._time !== 'all') {
            Object.assign(options, { time: this._time });
        }

        return options;
    }

    getFilter() {
        return this._raw;
    }

    getProjectId() {
        return this._projectId;
    }

    getOrganizationId() {
        return this._organizationId;
    }

    getEventType() {
        return this._eventType;
    }

    getOldestPossibleEventDate() {
        const date = this.objectIdService.getDate(this.getOrganizationId() || this.getProjectId());
        return date ? moment(date).subtract(3, 'days').toDate() : new Date(2012, 1, 1);
    }

    getTime() {
        return this._time || this.DEFAULT_TIME_FILTER;
    }

    getTimeRange() {
        const time = this.getTime();

        if (time === 'all') {
            return { start: undefined, end: undefined };
        }

        if (time === 'last hour') {
            return { start: moment().subtract(1, 'hours'), end: undefined };
        }

        if (time === 'last 24 hours') {
            return { start: moment().subtract(24, 'hours'), end: undefined };
        }

        if (time === 'last week') {
            return { start: moment().subtract(7, 'days').startOf('day'), end: undefined };
        }

        if (time === 'last 30 days') {
            return { start: moment().subtract(30, 'days').startOf('day'), end: undefined };
        }

        const range = this.dateRangeParserService.parse(time);
        if (range && range.start && range.end) {
            return { start: moment(range.start), end: moment(range.end) };
        }

        return { start: moment().subtract(7, 'days').startOf('day'), end: undefined };
    }

    getTimeOffset() {
        const offset = new Date().getTimezoneOffset();

        return offset !== 0 ? offset * -1 + 'm' : undefined;
    }

    hasFilter() {
        return this._raw || (this._time && this._time !== 'all');
    }

    includedInProjectOrOrganizationFilter(data) {
        if (!data.organizationId && !data.projectId) {
            return false;
        }

        // The all filter is set.
        if (!this._organizationId && !this._projectId) {
            return true;
        }

        return this._organizationId === data.organizationId || this._projectId === data.projectId;
    }

    setEventType(eventType, suspendNotifications) {
        if (eventType === this._eventType) {
            return;
        }

        this._eventType = eventType;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    setOrganizationId(id, suspendNotifications) {
        if ((id === this._organizationId) || (id && !this.objectIdService.isValid(id))) {
            return;
        }

        this._organizationId = id;
        this._projectId = null;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    setProjectId(id, suspendNotifications) {
        if ((id === this._projectId) || (id && !this.objectIdService.isValid(id))) {
            return;
        }

        this._projectId = id;
        this._organizationId = null;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    setTime(time, suspendNotifications?) {
        if (time === this._time) {
            return;
        }

        this._time = time || this.DEFAULT_TIME_FILTER;
        this.filterStoreService.setTimeFilter(this._time);

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    setFilter(raw, suspendNotifications) {
        if (raw === this._raw) {
            return;
        }

        this._raw = raw;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }
}

import { Injectable, OnInit } from "@angular/core";
import { FilterStoreService } from "./filter-store.service";
import { DateRangeParserService } from "./date-range-parser.service";
import { ObjectIdService } from "./object-id.service";
import { AppEventService } from "./app-event.service";
import * as moment from "moment";
import { Moment } from "moment";

@Injectable()

export class FilterService implements OnInit {
    DEFAULT_TIME_FILTER = "last week";
    private _time: string;
    private _eventType: string = "";
    private _organizationId: string = "";
    private _projectId: string = "";
    private _raw: string = "";

    constructor(
        private filterStoreService: FilterStoreService,
        private dateRangeParserService: DateRangeParserService,
        private objectIdService: ObjectIdService,
        private appEvent: AppEventService
    ) {
    }

    ngOnInit() {
        this._time = this.filterStoreService.getTimeFilter() || this.DEFAULT_TIME_FILTER;
        this._eventType = this.filterStoreService.getEventType() || null;
    }

    public apply(source, includeHiddenAndFixedFilter?: boolean): { [param: string]: string | string[]; } {
        return Object.assign({}, this.getDefaultOptions(includeHiddenAndFixedFilter), source);
    }

    public buildFilter(includeHiddenAndFixedFilter?: boolean): string {
        includeHiddenAndFixedFilter = (typeof includeHiddenAndFixedFilter !== "undefined") ?  includeHiddenAndFixedFilter : true;
        const filters: string[] = [];

        const organizationId = this.getOrganizationId();
        const projectId = this.getProjectTypeId();
        const eventType = this.getEventType();

        if (organizationId) {
            filters.push("organization:" + organizationId);
        }

        if (projectId) {
            filters.push("project:" + projectId);
        }

        if (eventType) {
            filters.push("type:" + this.filterStoreService.getEventType());
        }

        const filter = this._raw || "";
        const isWildCardFilter = filter.trim() === "*";

        if (includeHiddenAndFixedFilter && !isWildCardFilter) {
            const hasFixed = filter.search(/\bfixed:/i) !== -1;
            if (!hasFixed) {
                filters.push("fixed:false");
            }

            const hasHidden = filter.search(/\bhidden:/i) !== -1;
            if (!hasHidden) {
                filters.push("hidden:false");
            }
        }

        if (!!filter && !isWildCardFilter) {
            filters.push("(" + filter + ")");
        }

        return filters.join(" ").trim();
    }

    public clearFilter() {
        if (!this._raw) {
            return;
        }

        this.setFilter(null, false);
        this.fireFilterChanged();
    }

    public clearOrganizationAndProjectFilter() {
        if (!this._organizationId && !this._projectId) {
            return;
        }

        this._organizationId = this._projectId = null;
        this.fireFilterChanged();
    }

    public fireFilterChanged(includeHiddenAndFixedFilter?) {
        const options = {
            organization_id: this._organizationId,
            project_id: this._projectId,
            type: this._eventType
        };

        Object.assign(options, this.getDefaultOptions(includeHiddenAndFixedFilter));

        this.appEvent.fireEvent({
            type: "filterChanged",
            value: options
        });
    }

    public getDefaultOptions(includeHiddenAndFixedFilter): { filter?: string, offset?: string, time?: string } {
        const options = {};

        const offset = this.getTimeOffset();
        if (offset) {
            Object.assign(options, { offset });
        }

        const filter = this.buildFilter(includeHiddenAndFixedFilter);
        if (filter) {
            Object.assign(options, { filter });
        }

        const time = this.filterStoreService.getTimeFilter();
        if (!!time && time !== "all") {
            Object.assign(options, { time });
        }

        return options;
    }

    public getFilter(): string {
        return this._raw;
    }

    public getProjectType(): string {
        return this.filterStoreService.getProjectType();
    }

    public getProjectTypeId(): string {
        return typeof this.filterStoreService.getProjectId() === "string" ? this.filterStoreService.getProjectId() : "";
    }

    public getOrganizationId(): string {
        return typeof this.filterStoreService.getOrganizationId() === "string" ? this.filterStoreService.getOrganizationId() : "";
    }

    public getProjectId(): string {
        return this._projectId;
    }

    public getProjectName(): string {
        return this.filterStoreService.getProjectName();
    }

    public getEventType(): string {
        return typeof this.filterStoreService.getEventType() === "string" ? this.filterStoreService.getEventType() : "";
    }

    public getOldestPossibleEventDate(): Date {
        const date = this.objectIdService.getDate(this.getOrganizationId() || this.getProjectId());
        return date ? moment(date).subtract(3, "days").toDate() : new Date(2012, 1, 1);
    }

    public getTime(): string {
        return this._time || this.DEFAULT_TIME_FILTER;
    }

    public getTimeRange(): { start?: Moment, end?: Moment } {
        const time = this.filterStoreService.getTimeFilter();

        if (time === "all") {
            return { start: undefined, end: undefined };
        }

        if (time === "last hour") {
            return { start: moment().subtract(1, "hours"), end: undefined };
        }

        if (time === "last 24 hours") {
            return { start: moment().subtract(24, "hours"), end: undefined };
        }

        if (time === "last week") {
            return { start: moment().subtract(7, "days").startOf("day"), end: undefined };
        }

        if (time === "last 30 days") {
            return { start: moment().subtract(30, "days").startOf("day"), end: undefined };
        }

        const range = this.dateRangeParserService.parse(time);
        if (range && range.start && range.end) {
            return { start: moment(range.start), end: moment(range.end) };
        }

        return { start: moment().subtract(7, "days").startOf("day"), end: undefined };
    }

    public getTimeOffset(): string {
        const offset = new Date().getTimezoneOffset();

        return offset !== 0 ? offset * -1 + "m" : undefined;
    }

    public hasFilter(): boolean {
        return !!this._raw || (this._time && this._time !== "all");
    }

    public includedInProjectOrOrganizationFilter(data): boolean {
        if (!data.organizationId && !data.projectId) {
            return false;
        }

        const projectId = this.getProjectTypeId();
        const organizationId = this.getOrganizationId();

        if (!organizationId && !projectId) {
            return true;
        }

        return organizationId === data.organizationId || projectId === data.projectId;
    }

    public setEventType(eventType, suspendNotifications) {
        if (eventType === this._eventType) {
            return;
        }

        this._eventType = eventType;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    public setOrganizationId(id, suspendNotifications) {
        if ((id === this._organizationId) || (id && !this.objectIdService.isValid(id))) {
            return;
        }

        this._organizationId = id;
        this._projectId = null;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    public setProjectId(id, suspendNotifications) {
        if ((id === this._projectId) || (id && !this.objectIdService.isValid(id))) {
            return;
        }

        this._projectId = id;
        this._organizationId = null;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    public setTime(time, suspendNotifications?) {
        console.log("filter-service-set-time");
        if (time === this._time) {
            return;
        }

        this._time = time || this.DEFAULT_TIME_FILTER;
        this.filterStoreService.setTimeFilter(this._time);

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    public setFilter(raw, suspendNotifications?) {
        if (raw === this._raw) {
            return;
        }

        this._raw = raw;

        if (!suspendNotifications) {
            this.fireFilterChanged();
        }
    }

    public setProjectFilter(type, id, name) {
        this._projectId = id;
        if (type === "project") {
            this.filterStoreService.setProjectId(id);
            this.filterStoreService.setOrganizationId("");
        } else {
            this.filterStoreService.setOrganizationId(id);
            this.filterStoreService.setProjectId("");
        }
        this.filterStoreService.setProjectName(name);
        this.filterStoreService.setProjectType(type);
    }
}

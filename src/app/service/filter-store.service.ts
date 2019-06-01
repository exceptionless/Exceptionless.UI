import {EventEmitter, Injectable} from "@angular/core";
import {DRIVERS, Locker} from "angular-safeguard";
import {AppEventService} from "./app-event.service";
import { FilterChanged } from "../models/messaging";

@Injectable({ providedIn: "root" })
export class FilterStoreService {
    private timeFilterEventFire: EventEmitter<string>  = new EventEmitter();
    private projectFilterEventFire: EventEmitter<{ type: string, id: string }>  = new EventEmitter();

    constructor(
        private locker: Locker,
        private appEvent: AppEventService
    ) {
        this.locker.setDriverFallback(DRIVERS.LOCAL);
        this.locker.setNamespace("filter");
    }

    // TODO: Convert this to use properties.
    public getTimeFilter(): string {
        return this.locker.get(DRIVERS.LOCAL, "time");
    }

    public setTimeFilter(timeFilter: string) {
        this.locker.set(DRIVERS.LOCAL, "time", timeFilter);
        this.timeFilterEventFire.emit(this.getTimeFilter());
        this.appEvent.fireEvent({ type: "TimeFilterChanged", message: new FilterChanged() });
    }

    public getTimeFilterEmitter() {
        return this.timeFilterEventFire;
    }

    public getProjectFilterEmitter() {
        return this.projectFilterEventFire;
    }

    public getProjectId(): string {
        return this.locker.get(DRIVERS.LOCAL, "project_id");
    }

    public setProjectId(projectId: string) {
        this.locker.set(DRIVERS.LOCAL, "project_id", projectId);
    }

    public getProjectName(): string {
        return this.locker.get(DRIVERS.LOCAL, "project_name");
    }

    public setOrganizationId(organizationId: string) {
        this.locker.set(DRIVERS.LOCAL, "organization_id", organizationId);
    }

    public getOrganizationId(): string {
        return this.locker.get(DRIVERS.LOCAL, "organization_id");
    }

    public removeProjectName() {
        return this.locker.remove(DRIVERS.LOCAL, "project_name");
    }

    public setProjectName(projectName: string) {
        this.locker.set(DRIVERS.LOCAL, "project_name", projectName);
    }

    public getProjectType(): string {
        return this.locker.get(DRIVERS.LOCAL, "project_type");
    }

    public setProjectType(projectType: string) {
        this.locker.set(DRIVERS.LOCAL, "project_type", projectType);
        this.projectFilterEventFire.emit({type: this.getProjectType(), id: this.getProjectId()});
        this.appEvent.fireEvent({ type: "ProjectFilterChanged", message: new FilterChanged() });
    }

    public getEventType(): string {
        return this.locker.get(DRIVERS.LOCAL, "type");
    }

    public setEventType(type: string) {
        this.locker.set(DRIVERS.LOCAL, "type", type);
        this.appEvent.fireEvent({ type: "ProjectFilterChanged", message: new FilterChanged() });
    }
}

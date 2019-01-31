import {EventEmitter, Injectable} from '@angular/core';
import {DRIVERS, Locker} from 'angular-safeguard';
import {AppEventService} from './app-event.service';

@Injectable({
    providedIn: 'root'
})

export class FilterStoreService {
    timeFilterEventFire: EventEmitter<any> = new EventEmitter();
    projectFilterEventFire: EventEmitter<any> = new EventEmitter();
    constructor(
        private locker: Locker,
        private appEvent: AppEventService
    ) {
        this.locker.setDriverFallback(DRIVERS.LOCAL);
        this.locker.setNamespace('filter');
    }

    getTimeFilter() {
        return this.locker.get(DRIVERS.LOCAL, 'time');
    }

    setTimeFilter(timeFilter) {
        this.locker.set(DRIVERS.LOCAL, 'time', timeFilter);
        this.timeFilterEventFire.emit(this.getTimeFilter());
        this.appEvent.fireEvent({
            type: 'TimeFilterChanged'
        });
    }

    getTimeFilterEmitter() {
        return this.timeFilterEventFire;
    }

    getProjectFilterEmitter() {
        return this.projectFilterEventFire;
    }

    getProjectId() {
        return this.locker.get(DRIVERS.LOCAL, 'project_id');
    }

    setProjectId(projectId) {
        this.locker.set(DRIVERS.LOCAL, 'project_id', projectId);
    }

    getProjectName() {
        return this.locker.get(DRIVERS.LOCAL, 'project_name');
    }

    removeProjectName() {
        return this.locker.remove(DRIVERS.LOCAL, 'project_name');
    }

    setProjectName(projectName) {
        this.locker.set(DRIVERS.LOCAL, 'project_name', projectName);
    }

    getProjectType() {
        return this.locker.get(DRIVERS.LOCAL, 'project_type');
    }

    setProjectType(projectType) {
        this.locker.set(DRIVERS.LOCAL, 'project_type', projectType);
        this.projectFilterEventFire.emit({type: this.getProjectType(), id: this.getProjectId()});
        this.appEvent.fireEvent({
            type: 'ProjectFilterChanged'
        });
    }

    getEventType() {
        return this.locker.get(DRIVERS.LOCAL, 'type');
    }

    setEventType(type) {
        this.locker.set(DRIVERS.LOCAL, 'type', type);
    }
}

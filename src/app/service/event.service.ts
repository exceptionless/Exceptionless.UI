import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class EventService {

    constructor() {
    }

    calculateAveragePerHour(total, organizations) {};
    count(aggregations, optionsCallback, includeHiddenAndFixedFilter) {};
    getAll(options, optionsCallback, includeHiddenAndFixedFilter) {};
    getAllSessions(options, optionsCallback) {};
    getById(id, options, optionsCallback) {};
    getByReferenceId(id, options) {};
    getBySessionId(projectId, id, options, optionsCallback) {};
    getByStackId(id, options) {};
    markCritical(id) {};
    markNotCritical(id) {};
    remove(id) {};
}

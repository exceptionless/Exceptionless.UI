import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class StackService {

    constructor() {
    }

    disableNotifications(id) {};
    enableNotifications(id) {};
    getAll(options) {};
    getById(id) {};
    getFrequent(options) {};
    getUsers(options) {};
    getNew(options) {};
    markCritical(id) {};
    markNotCritical(id) {};
    markFixed(id, version) {};
    markNotFixed(id) {};
    markHidden(id) {};
    markNotHidden(id) {};
    promote(id) {};
    remove(id) {};
    removeLink(id) {};
}

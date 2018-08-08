import { Injectable } from '@angular/core';
import * as  ObjectId from 'objectid-js';

@Injectable({
    providedIn: 'root'
})

export class ObjectIdService {
    constructor() {}

    create(id) {
        return new ObjectId(id);
    }

    isValid(id) {
        if (!id || !(typeof id === 'number' || id instanceof Number) && id.length !== 12 && id.length !== 24) {
            return false;
        }

        if ((typeof id === 'string') && id.length === 24) {
            return /^[0-9a-fA-F]{24}$/i.test(id);
        }

        return true;
    }

    getDate(id) {
        if (!this.isValid(id)) {
            return undefined;
        }

        return this.create(id).getDate();
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";

@Injectable({
    providedIn: 'root'
})

export class OrganizationService extends  BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    addUser(id, email) {};
    create(name) {};
    changePlan(id, options) {};
    getOldestCreationDate(organizations) {};
    getOldestRetentionStartDate(organizations, maximumRetentionDays) {};
    getOldestPossibleEventDate(organizations, maximumRetentionDays) {};

    getAll(options, useCache) {
        this.route = 'api/v2/organizations';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        if (useCache === undefined || useCache) {
            //need to implement later[frank lin]
            return null;
        }

        return this.call();
    };

    getById(id, useCache) {
        this.route = 'api/v2/organizations/' + id;
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        if (useCache === undefined || useCache) {
            //need to implement later[frank lin]
            return null;
        }

        return this.call();
    };

    getInvoice(id) {};
    getInvoices(id, options) {};
    getPlans(id) {};
    isNameAvailable(name) {};
    remove(id) {};
    removeUser(id, email) {};
    update(id, organization) {};
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";
import { ObjectIdService } from "./object-id.service"
import * as moment from "moment";

@Injectable({
    providedIn: 'root'
})

export class OrganizationService extends  BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
        private objectIdService: ObjectIdService,
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    addUser(id, email) {
        this.route = 'api/v2/organizations/' + id + '/users/' + email;
        this.type = 'post';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    create(name) {
        this.route = 'api/v2/organizations';
        this.type = 'post';
        this.authentication = true;
        this.data = {
            'name': name
        };

        return this.call();
    };

    changePlan(id, options) {
        let params: string = '?token=9229slsdi3d';

        for (let key in options) {
            const value = options[key];
            params = params + '&' + key + '=' + value;
        }

        this.route = 'api/v2/organizations/' + id + '/change-plan';
        this.type = 'post';
        this.authentication = true;
        this.data = {
        };

        return this.call();
    };

    getOldestCreationDate(organizations) {
        if (organizations) {
            if (organizations.length > 1) {
                return new Date(organizations.reduce(function (o1, o2) {
                    return Math.min(this.objectIdService.create(o1.id).timestamp, this.objectIdService.create(o2.id).timestamp);
                }) * 1000);
            }

            if (organizations.length === 1) {
                return this.objectIdService.getDate(organizations[0].id);
            }
        }

        return new Date(2012, 1, 1);
    };

    getOldestRetentionStartDate(organizations, maximumRetentionDays) {
        if (!maximumRetentionDays) {
            maximumRetentionDays = moment().diff(new Date(2012, 1, 1), 'days');
        }

        let retentionDays = maximumRetentionDays;

        if (organizations) {
            if (organizations.length > 1) {
                retentionDays = organizations.reduce(function (o1, o2) {
                    return Math.max(o1.retention_days > 0 ? o1.retention_days : maximumRetentionDays, o2.retention_days > 0 ? o2.retention_days : maximumRetentionDays);
                });
            } else if (organizations.length === 1) {
                retentionDays = organizations[0].retention_days;
            }
        }

        return retentionDays <= 0 ? new Date(2012, 1, 1) : moment().subtract(retentionDays, 'days').toDate();
    };

    getOldestPossibleEventDate(organizations, maximumRetentionDays?) {
        return moment.max([
            moment(this.getOldestCreationDate(organizations)).subtract(3, 'days'),
            moment(this.getOldestRetentionStartDate(organizations, maximumRetentionDays))
        ]).toDate();
    };

    getAll(options, useCache) {
        this.route = 'api/v2/organizations/' + options;
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

    getInvoice(id) {
        this.route = 'api/v2/organizations/invoice/' + id;
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    getInvoices(id, options) {
        this.route = 'api/v2/organizations/invoices';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    getPlans(id) {
        this.route = 'api/v2/organizations/' + id + '/plans';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    isNameAvailable(name) {
        this.route = 'api/v2/organizations/check-name';
        this.type = 'get';
        this.authentication = true;
        this.data = {
            name: encodeURIComponent(name)
        };

        return this.call();
    };

    remove(id) {
        this.route = 'api/v2/organizations/' + id;
        this.type = 'delete';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    removeUser(id, email) {
        this.route = 'api/v2/organizations/' + id + '/users/' + email;
        this.type = 'delete';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    update(id, organization) {
        this.route = 'api/v2/organizations/' + id;
        this.type = 'patch';
        this.authentication = true;
        this.data = {};

        return this.call();
    };
}

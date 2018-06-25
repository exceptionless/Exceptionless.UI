import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ObjectIdService } from './object-id.service';
import { GlobalFunctions } from '../global-functions';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})

export class OrganizationService {

    constructor(
        private http: HttpClient,
        private objectIdService: ObjectIdService,
        private globalFunctions: GlobalFunctions
    ) {
    }

    addUser(id, email) {
        const url = 'organizations/' + id + '/users/' + email;
        const data = {};
        return this.http.post(url, data, { responseType: 'json' });
    }

    create(name) {
        const url = 'organizations';
        const data = {
            'name': name
        };
        return this.http.post(url, data, { responseType: 'json' });
    }

    changePlan(id, options) {
        const url = 'organizations/' + id + '/change-plan';
        const full_url = this.globalFunctions.setQueryParam(url,  options);
        const data = {};
        return this.http.post(full_url, data, { responseType: 'json' });
    }

    getOldestCreationDate(organizations) {
        if (organizations) {
            if (organizations.length > 1) {
                return new Date(organizations.reduce((o1, o2)  => {
                    return Math.min(this.objectIdService.create(o1.id).getTimestamp(), this.objectIdService.create(o2.id).getTimestamp());
                }) * 1000);
            }

            if (organizations.length === 1) {
                return this.objectIdService.getDate(organizations[0].id);
            }
        }

        return new Date(2012, 1, 1);
    }

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
    }

    getOldestPossibleEventDate(organizations, maximumRetentionDays?) {
        return moment.max([
            moment(this.getOldestCreationDate(organizations)).subtract(3, 'days'),
            moment(this.getOldestRetentionStartDate(organizations, maximumRetentionDays))
        ]).toDate();
    }

    getAll(options, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[frank lin]
            return null;
        }

        const url = 'organizations/' + options;
        return this.http.get(url, { responseType: 'json' });
    }

    getById(id, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[frank lin]
            return null;
        }

        const url = 'organizations/' + id;
        return this.http.get(url, { responseType: 'json' });
    }

    getInvoice(id) {
        const url = 'organizations/invoice/' + id;
        return this.http.get(url, { responseType: 'json' });
    }

    getInvoices(id, options) {
        const url = 'organizations/invoices';
        return this.http.get(url, { responseType: 'json' });
    }

    getPlans(id) {
        const url = 'organizations/' + id + '/plans';
        return this.http.get(url, { responseType: 'json' });
    }

    isNameAvailable(name) {
        const url = 'organizations/check-name?name=' + encodeURIComponent(name);
        return this.http.get(url, { responseType: 'json' });
    }

    remove(id) {
        const url = 'organizations/' + id;
        return this.http.delete(url, { responseType: 'json' });
    }

    removeUser(id, email) {
        const url = 'organizations/' + id + '/users/' + email;
        return this.http.delete(url, { responseType: 'json' });
    }

    update(id, organization) {
        const url = 'api/v2/organizations/' + id;
        return this.http.patch(url, organization, { responseType: 'json' });
    }
}

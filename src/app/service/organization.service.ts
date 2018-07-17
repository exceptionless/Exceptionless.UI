import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ObjectIdService } from './object-id.service';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})

export class OrganizationService {

    constructor(
        private http: HttpClient,
        private objectIdService: ObjectIdService,
    ) {
    }

    addUser(id, email) {
        const data = {};
        return this.http.post(`organizations/${id}/users/${email}`, data);
    }

    create(name) {
        const data = {
            'name': name
        };
        return this.http.post('organizations', data);
    }

    changePlan(id, options) {
        const data = {};
        return this.http.post(`organizations/${id}/change-plan`, data, { params: options });
    }

    getOldestCreationDate(organizations) {
        if (organizations) {
            if (organizations.length > 1) {
                return new Date(organizations.reduce((o1, o2)  => {
                    return Math.min(this.objectIdService.create(o1.id).getDate(), this.objectIdService.create(o2.id).getDate());
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

    getAll(options?): Observable<HttpResponse<any>> {
        const mergedOptions = Object.assign({ limit: 100 }, options);
        return this.http.get('organizations', { observe: 'response', params: mergedOptions });
    }

    getById(id) {
        return this.http.get(`organizations/${id}`);
    }

    getInvoice(id) {
        return this.http.get(`organizations/invoice/${id}`);
    }

    getInvoices(id, options) {
        return this.http.get('organizations/invoices');
    }

    getPlans(id) {
        return this.http.get(`organizations/${id}/plans`);
    }

    isNameAvailable(name) {
        return this.http.get('organizations/check-name?name=' + encodeURIComponent(name));
    }

    remove(id) {
        return this.http.delete(`organizations/${id}`);
    }

    removeUser(id, email) {
        return this.http.delete(`organizations/${id}/users` + email);
    }

    update(id, organization) {
        return this.http.patch(`api/v2/organizations/${id}`, organization);
    }
}

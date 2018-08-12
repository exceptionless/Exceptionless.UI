import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FilterService } from './filter.service';
import { OrganizationService } from './organization.service';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})

export class EventService {
    constructor(
        private http: HttpClient,
        private filterService: FilterService,
        private organizationService: OrganizationService,
    ) {}

    calculateAveragePerHour(total, organizations) {
        const range = this.filterService.getTimeRange();
        range.start = moment.max([range.start, moment(this.filterService.getOldestPossibleEventDate()), moment(this.organizationService.getOldestPossibleEventDate(organizations))].filter(function(d) { return !!d; }));
        range.end = range.end || moment();

        const result: number = total / range.end.diff(range.start, 'hours', true);

        return !isNaN(result) && isFinite(result) ? result : 0.0;
    }

    count(aggregations, optionsCallback?, includeHiddenAndFixedFilter?) {
        let options = this.filterService.apply((aggregations && aggregations.length > 0) ? { aggregations: aggregations } : {}, includeHiddenAndFixedFilter);
        options = typeof optionsCallback === 'function' ? optionsCallback(options) : options;

        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/events/count`, { params: options });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/events/count`, { params: options });
        }

        return this.http.get('events/count', { params: options });
    }

    getAll(options, optionsCallback?, includeHiddenAndFixedFilter?): Observable<HttpResponse<any>> {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const mergedOptions = optionsCallback(this.filterService.apply(options, includeHiddenAndFixedFilter));

        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/events`, { observe: 'response', params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/events`, { observe: 'response', params: mergedOptions });
        }

        return this.http.get('events', { observe: 'response', params: mergedOptions });
    }

    getAllSessions(options, optionsCallback): Observable<HttpResponse<any>>  {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const mergedOptions = optionsCallback(this.filterService.apply(options, false));

        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/events/sessions`, { observe: 'response', params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/events/sessions`, { observe: 'response', params: mergedOptions });
        }

        return this.http.get(`events/sessions`, { observe: 'response', params: mergedOptions });
    }

    getById(id, options, optionsCallback): Observable<HttpResponse<any>> {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const data = optionsCallback(this.filterService.apply(options));
        return this.http.get(`events/${id}`, { observe: 'response', params: data });
    }

    getByReferenceId(id, options) {
        const url = 'events/by-ref/' + id + '/' + this.filterService.apply(options, false);
        return this.http.get(url);
    }

    getBySessionId(projectId, id, options, optionsCallback) {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const url = 'projects/' + projectId + '/events/sessions/' + id + '/' + optionsCallback(this.filterService.apply(options, false));
        return this.http.get(url);
    }

    getByStackId(id, options): Observable<HttpResponse<any>> {
        const params = this.filterService.apply(options, false);
        return this.http.get(`stacks/${id}/events`, { observe: 'response', params: params });
    }

    markCritical(id) {
        const data = {};
        return this.http.post(`events/${id}/mark-critical`, data);
    }

    markNotCritical(id) {
        return this.http.delete(`events/${id}/mark-critical`);
    }

    remove(id) {
        return this.http.delete(`events/${id}`);
    }
}

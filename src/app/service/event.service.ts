import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FilterService } from './filter.service';
import { OrganizationService } from './organization.service';
import { GlobalFunctions } from '../global-functions';
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
        private globalFunctions: GlobalFunctions
    ) {
    }

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
            let organization_full_url = 'organizations/' + organization + '/events/count';
            organization_full_url = this.globalFunctions.setQueryParam(organization_full_url, options);
            return this.http.get(organization_full_url, { responseType: 'json' });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            let project_full_url = 'projects/' + project + '/events/count';
            project_full_url = this.globalFunctions.setQueryParam(project_full_url, options);
            return this.http.get(project_full_url, { responseType: 'json' });
        }

        let full_url = 'events/count';
        full_url = this.globalFunctions.setQueryParam(full_url, options);
        return this.http.get(full_url, { responseType: 'json' });
    }

    getAll(options, optionsCallback?, includeHiddenAndFixedFilter?): Observable<HttpResponse<any>> {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const mergedOptions = optionsCallback(this.filterService.apply(options, includeHiddenAndFixedFilter));

        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const organizationUrl = 'organizations/' + organization + '/events/' + mergedOptions;
            return this.http.get(organizationUrl, { observe: 'response' });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const projectUrl = 'projects/' + project + '/events/' + mergedOptions;
            return this.http.get(projectUrl, { observe: 'response' });
        }

        let full_url = 'events';
        full_url = this.globalFunctions.setQueryParam(full_url, mergedOptions);
        return this.http.get(full_url, { observe: 'response' });
    }

    getAllSessions(options, optionsCallback) {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const mergedOptions = optionsCallback(this.filterService.apply(options, false));

        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const organizationUrl = 'organizations/' + organization + '/events/sessions/' + mergedOptions;
            return this.http.get(organizationUrl);
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const organizationUrl = 'projects/' + project + '/events/sessions/' + mergedOptions;
            return this.http.get(organizationUrl);
        }

        return this.http.get('events/sessions/' + mergedOptions);
    }

    getById(id, options, optionsCallback) {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const data = optionsCallback(this.filterService.apply(options));
        let full_url = 'events/' + id;
        full_url = this.globalFunctions.setQueryParam(full_url, data);
        return this.http.get(full_url);
    }

    getByReferenceId(id, options) {
        const url = 'events/by-ref/' + id + '/' + this.filterService.apply(options, false);
        return this.http.get(url, { responseType: 'json' });
    }

    getBySessionId(projectId, id, options, optionsCallback) {
        optionsCallback = typeof optionsCallback === 'function' ? optionsCallback : function(o) { return o; };
        const url = 'projects/' + projectId + '/events/sessions/' + id + '/' + optionsCallback(this.filterService.apply(options, false));
        return this.http.get(url, { responseType: 'json' });
    }

    getByStackId(id, options) {
        const url = 'stacks/events/' + this.filterService.apply(options, false);
        return this.http.get(url, { responseType: 'json' });
    }

    markCritical(id) {
        const data = {};
        return this.http.post('events/' + id + '/mark-critical', data);
    }

    markNotCritical(id) {
        return this.http.delete('events/' + id + '/mark-critical');
    }

    remove(id) {
        return this.http.delete('events/' + id);
    }
}

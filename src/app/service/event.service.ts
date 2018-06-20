import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";
import { FilterService } from "./filter.service";
import { OrganizationService } from "./organization.service";
import { Observable } from 'rxjs/Observable';
import * as moment from "moment";

@Injectable({
    providedIn: 'root'
})

export class EventService extends BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
        private filterService: FilterService,
        private organizationService: OrganizationService
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    calculateAveragePerHour(total, organizations) {
        let range = this.filterService.getTimeRange();
        range.start = moment.max([range.start, moment(this.filterService.getOldestPossibleEventDate()), moment(this.organizationService.getOldestPossibleEventDate(organizations))].filter(function(d){ return !!d; }));
        range.end = range.end || moment();

        let result: number = total / range.end.diff(range.start, 'hours', true);

        return !isNaN(result) && isFinite(result) ? result : 0.0;
    };

    count(aggregations, optionsCallback?, includeHiddenAndFixedFilter?) {
        let options = this.filterService.apply((aggregations && aggregations.length > 0) ? { aggregations: aggregations } : {}, includeHiddenAndFixedFilter);
        options = typeof optionsCallback == 'function' ? optionsCallback(options) : options;

        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/events/count';
            this.type = 'get';
            this.data = options;
            this.authentication = true;

            return this.call();
        }

        let project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/events/count';
            this.type = 'get';
            this.data = options;
            this.authentication = true;

            return this.call();
        }

        this.route = 'api/v2/events/count';
        this.type = 'get';
        this.data = options;
        this.authentication = true;

        return this.call();
    };

    getAll(options, optionsCallback?, includeHiddenAndFixedFilter?): Observable<HttpResponse<any>> {
        optionsCallback = typeof optionsCallback == 'function' ? optionsCallback : function(o){ return o; };
        let mergedOptions = optionsCallback(this.filterService.apply(options, includeHiddenAndFixedFilter));

        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/events/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.http.get(this.route, {
                observe: 'response',
                headers: new HttpHeaders({
                    'Content-Type':  'application/json',
                    'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                })
            });
        }

        var project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/events/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.http.get(this.route, {
                observe: 'response',
                headers: new HttpHeaders({
                    'Content-Type':  'application/json',
                    'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                })
            });
        }

        this.route = 'api/v2/events';
        this.type = 'get';
        this.data = mergedOptions;
        let full_url = this._global.BASE_URL + this.route ;
        full_url = full_url + '?token=9229slsdi3d';
        for (let key in this.data) {
            const value = this.data[key];
            full_url = full_url + '&' + key + '=' + value;
        }

        return this.http.get(full_url, {
            observe: 'response',
            headers: new HttpHeaders({
                'Content-Type':  'application/json',
                'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
            })
        });
    };

    getAllSessions(options, optionsCallback) {
        optionsCallback = typeof optionsCallback == 'function' ? optionsCallback : function(o){ return o; };
        let mergedOptions = optionsCallback(this.filterService.apply(options, false));

        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/events/sessions/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            this.call();
        }

        let project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/events/sessions/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            this.call();
        }

        this.route = 'api/v2/events/sessions/' + mergedOptions;
        this.type = 'get';
        this.data = {};

        this.call();
    };

    getById(id, options, optionsCallback) {
        optionsCallback = typeof optionsCallback == 'function' ? optionsCallback : function(o){ return o; };

        this.route = 'api/v2/events/' + id;
        this.type = 'get';
        this.data = optionsCallback(this.filterService.apply(options));

        this.call();
    };

    getByReferenceId(id, options) {
        this.route = 'api/v2/events/by-ref/' + id + '/' + this.filterService.apply(options, false);
        this.type = 'get';
        this.data = {};

        this.call();
    };

    getBySessionId(projectId, id, options, optionsCallback) {
        optionsCallback = typeof optionsCallback == 'function' ? optionsCallback : function(o){ return o; };

        this.route = 'api/v2/projects/' + projectId + '/events/sessions/' + id + '/' + optionsCallback(this.filterService.apply(options, false));
        this.type = 'get';
        this.data = {};

        this.call();
    };

    getByStackId(id, options) {
        this.route = 'api/v2/stacks/events/' + this.filterService.apply(options, false);
        this.type = 'get';
        this.data = {};

        this.call();
    };

    markCritical(id) {
        this.route = 'api/v2/events/' + id + '/mark-critical';
        this.type = 'post';
        this.data = {};

        this.call();
    };

    markNotCritical(id) {
        this.route = 'api/v2/events/' + id + '/mark-critical';
        this.type = 'delete';
        this.data = {};

        this.call();
    };

    remove(id) {
        this.route = 'api/v2/events/' + id;
        this.type = 'delete';
        this.data = {};

        this.call();
    };
}

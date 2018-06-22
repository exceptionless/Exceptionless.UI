import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";
import { FilterService } from "./filter.service";
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})

export class StackService extends BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
        private filterService: FilterService,
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    addLink(id, url) {
        this.route = 'api/v2/stacks/add-link';
        this.type = 'post';
        this.data = url;
        this.changeContentType = true;
        this.contentType = 'text/plain; charset=UTF-8';

        return this.call();
    };

    disableNotifications(id) {
        this.route = 'api/v2/stacks/' + id + '/notifications';
        this.type = 'delete';
        this.data = {};

        return this.call();
    };

    enableNotifications(id) {
        this.route = 'api/v2/stacks/' + id + '/notifications';
        this.type = 'post';
        this.data = {};

        return this.call();
    };

    getAll(options) {
        let mergedOptions = this.filterService.apply(options);
        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/stacks/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();
        }

        let project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/stacks/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();
        }

        this.route = 'api/v2/stacks/' + mergedOptions;
        this.type = 'get';
        this.data = {};

        return this.call();
    };

    getById(id) {
        this.route = 'api/v2/stacks/' + id;
        this.type = 'get';
        this.data = {};

        return this.call();
    };

    getFrequent(options?): Observable<HttpResponse<any>> {
        let mergedOptions = this.filterService.apply(options);
        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/stacks/frequent/' + mergedOptions;
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
            this.route = 'api/v2/projects/' + project + '/stacks/frequent/' + mergedOptions;
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

        this.route = 'api/v2/stacks/frequent';
        this.type = 'get';
        this.data = mergedOptions;
        this.authentication =  true;
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

    getUsers(options) {
        let mergedOptions = this.filterService.apply(options);
        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/stacks/users/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();
        }

        let project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/stacks/users/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();

        }

        this.route = 'api/v2/stacks/users/' + mergedOptions;
        this.type = 'get';
        this.data = {};

        return this.call();
    };

    getNew(options) {
        let mergedOptions = this.filterService.apply(options);
        let organization = this.filterService.getOrganizationId();
        if (organization) {
            this.route = 'api/v2/organizations/' + organization + '/stacks/new/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();
        }

        var project = this.filterService.getProjectId();
        if (project) {
            this.route = 'api/v2/projects/' + project + '/stacks/new/' + mergedOptions;
            this.type = 'get';
            this.data = {};

            return this.call();
        }

        this.route = 'api/v2/stacks/new/' + mergedOptions;
        this.type = 'get';
        this.data = {};

        return this.call();
    };

    markCritical(id) {
        this.route = 'api/v2/stacks/' + id + '/mark-critical';
        this.type = 'post';
        this.data = {};

        return this.call();
    };

    markNotCritical(id) {
        this.route = 'api/v2/stacks/' + id + '/mark-critical';
        this.type = 'delete';
        this.data = {};

        return this.call();
    };

    markFixed(id, version) {
        this.route = 'api/v2/stacks/' + id + '/mark-fixed';
        this.type = 'post';
        this.data = {
            version: version
        };

        return this.call();
    };

    markNotFixed(id?) {
        this.route = 'api/v2/stacks/' + id + '/mark-fixed';
        this.type = 'delete';
        this.data = {};

        return this.call();
    };

    markHidden(id?) {
        this.route = 'api/v2/stacks/' + id + '/mark-hidden';
        this.type = 'post';
        this.data = {};

        return this.call();
    };

    markNotHidden(id?) {
        this.route = 'api/v2/stacks/' + id + '/mark-hidden';
        this.type = 'delete';
        this.data = {};

        return this.call();
    };

    promote(id) {
        this.route = 'api/v2/stacks/' + id + '/promote';
        this.type = 'post';
        this.data = {};

        return this.call();
    };

    remove(id?) {
        this.route = 'api/v2/stacks/' + id;
        this.type = 'delete';
        this.data = {};

        return this.call();
    };

    removeLink(id, url) {
        this.route = 'api/v2/stacks/' + id + '/remove-link';
        this.type = 'delete';
        this.data = url;
        this.changeContentType = true;
        this.contentType = 'text/plain; charset=UTF-8';

        return this.call();
    };
}
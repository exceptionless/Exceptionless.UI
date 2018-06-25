import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FilterService } from './filter.service';
import { Observable } from 'rxjs/Observable';
import { GlobalFunctions } from '../global-functions';

@Injectable({
    providedIn: 'root'
})

export class StackService {

    constructor(
        private http: HttpClient,
        private filterService: FilterService,
        private globalFunctions: GlobalFunctions
    ) {
    }

    addLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const link = 'stacks/add-link';
        return this.http.post(link,  url, httpOptions);
    }

    disableNotifications(id) {
        const url = 'stacks/' + id + '/notifications';
        return this.http.delete(url,   { responseType: 'json' });
    }

    enableNotifications(id) {
        const url = 'stacks/' + id + '/notifications';
        const data = {};
        return this.http.post(url,  data, { responseType: 'json' });
    }

    getAll(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const orgnizationUrl = 'organizations/' + organization + '/stacks/' + mergedOptions;
            return this.http.get(orgnizationUrl,   { responseType: 'json' });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const projectUrl = 'projects/' + project + '/stacks/' + mergedOptions;
            return this.http.get(projectUrl,   { responseType: 'json' });
        }

        const url = 'stacks/' + mergedOptions;
        return this.http.get(url,   { responseType: 'json' });
    }

    getById(id) {
        const url = 'stacks/' + id;
        return this.http.get(url,   { responseType: 'json' });
    }

    getFrequent(options?): Observable<HttpResponse<any>> {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const organizationUrl = 'organizations/' + organization + '/stacks/frequent/' + mergedOptions;
            return this.http.get(organizationUrl, {
                observe: 'response',
            });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const projectUrl = 'projects/' + project + '/stacks/frequent/' + mergedOptions;
            return this.http.get(projectUrl, {
                observe: 'response',
            });
        }

        const data = mergedOptions;
        let full_url = 'stacks/frequent';
        full_url = this.globalFunctions.setQueryParam(full_url,  data);
        return this.http.get(full_url, {
            observe: 'response',
        });
    }

    getUsers(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const organizationUrl = 'organizations/' + organization + '/stacks/users/' + mergedOptions;
            return this.http.get(organizationUrl, { responseType: 'json' });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const projectUrl = 'projects/' + project + '/stacks/users/' + mergedOptions;
            return this.http.get(projectUrl, { responseType: 'json' });
        }

        const url = 'stacks/users/' + mergedOptions;
        return this.http.get(url, { responseType: 'json' });
    }

    getNew(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            const organizationUrl = 'organizations/' + organization + '/stacks/new/' + mergedOptions;
            return this.http.get(organizationUrl, { responseType: 'json' });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            const projectUrl = 'projects/' + project + '/stacks/new/' + mergedOptions;
            return this.http.get(projectUrl, { responseType: 'json' });
        }

        const url = 'stacks/new/' + mergedOptions;
        return this.http.get(url, { responseType: 'json' });
    }

    markCritical(id) {
        const url = 'stacks/' + id + '/mark-critical';
        const data = {};
        return this.http.post(url, data, { responseType: 'json' });
    }

    markNotCritical(id) {
        const url = 'stacks/' + id + '/mark-critical';
        return this.http.delete(url, { responseType: 'json' });
    }

    markFixed(id, version) {
        const url = 'stacks/' + id + '/mark-fixed';
        const data = {
            version: version
        };
        return this.http.post(url, data, { responseType: 'json' });
    }

    markNotFixed(id?) {
        const url = 'stacks/' + id + '/mark-fixed';
        return this.http.delete(url, { responseType: 'json' });
    }

    markHidden(id?) {
        const url = 'stacks/' + id + '/mark-hidden';
        const data = {};
        return this.http.post(url, data, { responseType: 'json' });
    }

    markNotHidden(id?) {
        const url = 'stacks/' + id + '/mark-hidden';
        return this.http.delete(url,  { responseType: 'json' });
    }

    promote(id) {
        const url = 'stacks/' + id + '/promote';
        const data = {};
        return this.http.post(url,  data, { responseType: 'json' });
    }

    remove(id?) {
        const url = 'stacks/' + id;
        return this.http.delete(url,   { responseType: 'json' });
    }

    removeLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const link = 'stacks/' + id + '/remove-link';
        return this.http.delete(link, httpOptions);
    }
}

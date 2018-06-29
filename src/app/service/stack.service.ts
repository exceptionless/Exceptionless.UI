import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FilterService } from './filter.service';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})

export class StackService {

    constructor(
        private http: HttpClient,
        private filterService: FilterService,
    ) {
    }

    addLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        return this.http.post('stacks/add-link',  url, httpOptions);
    }

    disableNotifications(id) {
        return this.http.delete(`stacks/${id}/notifications`);
    }

    enableNotifications(id) {
        const data = {};
        return this.http.post(`stacks/${id}/notifications`,  data);
    }

    getAll(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/${mergedOptions}`);
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/${mergedOptions}`);
        }

        return this.http.get(`stacks/${mergedOptions}`);
    }

    getById(id): Observable<HttpResponse<any>> {
        return this.http.get('stacks/' + id, {
            observe: 'response',
        });
    }

    getFrequent(options?): Observable<HttpResponse<any>> {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/frequent/${mergedOptions}`, {
                observe: 'response',
            });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/frequent/${mergedOptions}`, {
                observe: 'response',
            });
        }

        const data = mergedOptions;
        return this.http.get('stacks/frequent', { observe: 'response', params: data });
    }

    getUsers(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/users/${mergedOptions}`);
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/users/${mergedOptions}`);
        }

        return this.http.get(`stacks/users/${mergedOptions}`);
    }

    getNew(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/new/${mergedOptions}`);
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/new/${mergedOptions}`);
        }

        return this.http.get(`stacks/new/${mergedOptions}`);
    }

    markCritical(id) {
        const data = {};
        return this.http.post(`stacks/${id}/mark-critical`, data);
    }

    markNotCritical(id) {
        return this.http.delete(`stacks/${id}/mark-critical`);
    }

    markFixed(id, version) {
        const data = {
            version: version
        };
        return this.http.post(`stacks/${id}/mark-fixed`, data);
    }

    markNotFixed(id?) {
        return this.http.delete(`stacks/${id}/mark-fixed`);
    }

    markHidden(id?) {
        const data = {};
        return this.http.post(`stacks/${id}/mark-hidden`, data);
    }

    markNotHidden(id?) {
        return this.http.delete(`stacks/${id}/mark-hidden`);
    }

    promote(id) {
        const data = {};
        return this.http.post(`stacks/${id}/promote`,  data);
    }

    remove(id?) {
        return this.http.delete(`stacks/${id}`);
    }

    removeLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        return this.http.delete(`stacks/${id}/remove-link`, httpOptions);
    }
}

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
    ) {}

    addLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json;charset=UTF-8',
            })
        };
        return this.http.post(`stacks/${id}/add-link`,  {value: url}, httpOptions).toPromise();
    }

    disableNotifications(id) {
        return this.http.delete(`stacks/${id}/notifications`).toPromise();
    }

    enableNotifications(id) {
        const data = {};
        return this.http.post(`stacks/${id}/notifications`,  data).toPromise();
    }

    getAll(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks`, { params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks`, { params: mergedOptions });
        }

        return this.http.get(`stacks`, { params: mergedOptions });
    }

    getById(id) {
        return this.http.get('stacks/' + id, { observe: 'response' }).toPromise();
    }

    getFrequent(options?) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/frequent`, { observe: 'response', params: mergedOptions }).toPromise();
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/frequent`, { observe: 'response', params: mergedOptions }).toPromise();
        }

        const data = mergedOptions;
        return this.http.get('stacks/frequent', { observe: 'response', params: data }).toPromise();
    }

    getUsers(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/users`, { params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/users`, { params: mergedOptions });
        }

        return this.http.get(`stacks/users`, { params: mergedOptions });
    }

    getNew(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get(`organizations/${organization}/stacks/new`, { params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get(`projects/${project}/stacks/new`, { params: mergedOptions });
        }

        return this.http.get(`stacks/new`, { params: mergedOptions });
    }

    markCritical(id) {
        const data = {};
        return this.http.post(`stacks/${id}/mark-critical`, data).toPromise();
    }

    markNotCritical(id) {
        return this.http.delete(`stacks/${id}/mark-critical`).toPromise();
    }

    markFixed(id, version?) {
        const data = {
            id: id
        };
        return this.http.post(`stacks/${id}/mark-fixed` + (version ? `?version=${version}` : ''), data).toPromise();
    }

    markNotFixed(id?) {
        return this.http.delete(`stacks/${id}/mark-fixed`).toPromise();
    }

    markHidden(id?) {
        const data = {};
        return this.http.post(`stacks/${id}/mark-hidden`, data).toPromise();
    }

    markNotHidden(id?) {
        return this.http.delete(`stacks/${id}/mark-hidden`).toPromise();
    }

    promote(id) {
        const data = {};
        return this.http.post(`stacks/${id}/promote`,  data, { observe: 'response' }).toPromise();
    }

    remove(id?) {
        return this.http.delete(`stacks/${id}`).toPromise();
    }

    removeLink(id, url) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json;charset=UTF-8',
            }),
            body: url
        };
        return this.http.post(`stacks/${id}/remove-link`, {value: url}, httpOptions).toPromise();
    }
}

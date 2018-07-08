import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ProjectService {

    constructor(
        private http: HttpClient,
    ) {
    }

    addSlack(id) {}

    create(organizationId, name) {
        const data = {
            'organization_id': organizationId,
            'name': name,
            'delete_bot_data_enabled': true
        };
        return this.http.post('projects', data);
    }

    demoteTab(id, name) {
        return this.http.delete(`projects/${id}/promotedtabs?name=${name}`);
    }

    getAll(options, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[Exceptionless]
            return null;
        }

        return this.http.get('projects?limit=100');
    }

    getById(id, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[Exceptionless]
            return null;
        }

        return this.http.get(`projects/${id}`);
    }

    getByOrganizationId(id, options, useCache) {
        return this.http.get(`organizations/${id}/projects`);
    }

    getConfig(id) {
        // return _cachedRestangular.one('projects', id).one('config').get();
        return this.http.get(`projects/${id}/config`);
    }

    getNotificationSettings(id, userId) {
        // return _cachedRestangular.one('users', userId).one('projects', id).one('notifications').get();
        return this.http.get(`users/${userId}/projects/${id}/notifications`);
    }

    getIntegrationNotificationSettings(id, integration) {
        // return _cachedRestangular.one('projects', id).one(integration, 'notifications').get();
        return this.http.get(`projects/${id}/${integration}/notifications`);
    }

    isNameAvailable(organizationId, name) {
        return this.http.get(`organizations/${organizationId}/projects/check-name?name=${encodeURIComponent(name)}`);
    }

    promoteTab(id, name) {
        const data = {
            name: name
        };
        return this.http.post(`projects/${id}/promotedtabs`,  data);
    }

    remove(id) {
        return this.http.delete(`projects/${id}`);
    }

    removeConfig(id, key) {
        return this.http.delete(`projects/${id}/config?key=${key}`);
    }

    removeData(id, key) {
        return this.http.delete(`projects/${id}/data?key=${key}`);
    }

    removeSlack(id) {
        return this.http.delete(`projects/${id}/slack`);
    }

    removeNotificationSettings(id, userId) {
        return this.http.delete(`users/${userId}/projects/${id}/notifications`);
    }

    resetData(id) {
        return this.http.get(`api/v2/projects/${id}/reset-data`);
    }

    update(id, project) {
        const data = project;
        return this.http.patch(`projects/${id}`,  data);
    }

    setConfig(id, key, value) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const data = {
            key: key
        };
        return this.http.post(`projects/${id}/config/${value}`,  data, httpOptions);
    }

    setData(id, key, value) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const data = {
            key: key
        };
        return this.http.post(`projects/${id}/data/${value}`,  data, httpOptions);
    }

    setNotificationSettings(id, userId, settings) {
        return this.http.post(`users/${userId}/projects/${id}/notifications`,  settings);
    }

    setIntegrationNotificationSettings(id, integration, settings) {
        const data = settings;
        return this.http.get(`projects/${id}/${integration}/notifications`);
    }
}

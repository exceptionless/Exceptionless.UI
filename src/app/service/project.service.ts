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
        const url = 'projects';
        const data = {
            'organization_id': organizationId,
            'name': name,
            'delete_bot_data_enabled': true
        };
        return this.http.post(url, data, { responseType: 'json' });
    }

    demoteTab(id, name) {
        const url = 'projects/' + id + '/promotedtabs?name=' + name;
        return this.http.delete(url,  { responseType: 'json' });
    }

    getAll(options, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[frank lin]
            return null;
        }

        const url = 'projects?limit=100';
        return this.http.get(url,  { responseType: 'json' });
    }

    getById(id, useCache) {
        if (useCache === undefined || useCache) {
            // need to implement later[frank lin]
            return null;
        }

        const url = 'organizations/' + id;
        return this.http.get(url,  { responseType: 'json' });
    }

    getByOrganizationId(id, options, useCache) {
        const url = 'organizations/' + id + '/projects';
        return this.http.get(url,  { responseType: 'json' });
    }

    getConfig(id) {
        // return _cachedRestangular.one('projects', id).one('config').get();
        const url = 'projects/' + id + '/config';
        return this.http.get(url,  { responseType: 'json' });
    }

    getNotificationSettings(id, userId) {
        // return _cachedRestangular.one('users', userId).one('projects', id).one('notifications').get();
        const url = 'users/' + userId + '/projects/' + id + '/notifications';
        return this.http.get(url,  { responseType: 'json' });
    }

    getIntegrationNotificationSettings(id, integration) {
        // return _cachedRestangular.one('projects', id).one(integration, 'notifications').get();
        const url = 'projects/' + id + '/' + integration + '/notifications';
        return this.http.get(url,  { responseType: 'json' });
    }

    isNameAvailable(organizationId, name) {
        const url = 'organizations/' + organizationId + '/projects/check-name?name=' + encodeURIComponent(name);
        return this.http.get(url,  { responseType: 'json' });
    }

    promoteTab(id, name) {
        const url = 'projects/' + id + '/promotedtabs';
        const data = {
            name: name
        };
        return this.http.post(url,  data, { responseType: 'json' });
    }

    remove(id) {
        const url = 'projects/' + id;
        return this.http.delete(url,  { responseType: 'json' });
    }

    removeConfig(id, key) {
        const url = 'projects/' + id + '/config?key=' + key;
        return this.http.delete(url,  { responseType: 'json' });
    }

    removeData(id, key) {
        const url = 'projects/' + id + '/data?key=' + key;
        return this.http.delete(url,  { responseType: 'json' });
    }

    removeSlack(id) {
        const url = 'projects/' + id + '/slack';
        return this.http.delete(url,  { responseType: 'json' });
    }

    removeNotificationSettings(id, userId) {
        const url = 'users/' + userId + '/projects' + id + '/notifications';
        return this.http.delete(url,  { responseType: 'json' });
    }

    resetData(id) {
        const url = 'api/v2/projects/' + id + '/reset-data';
        return this.http.get(url,  { responseType: 'json' });
    }

    update(id, project) {
        const url = 'projects/' + id;
        const data = project;
        return this.http.patch(url,  data, { responseType: 'json' });
    }

    setConfig(id, key, value) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const url = 'projects/' + id + '/config/' + value;
        const data = {
            key: key
        };
        return this.http.post(url,  data, httpOptions);
    }

    setData(id, key, value) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'text/plain; charset=UTF-8',
            })
        };
        const url = 'projects/' + id + '/data/' + value;
        const data = {
            key: key
        };
        return this.http.post(url,  data, httpOptions);
    }

    setNotificationSettings(id, userId, settings) {
        const url = 'users/' + userId + '/projects/' + id + '/notifications';
        return this.http.post(url,  settings, { responseType: 'json' });
    }

    setIntegrationNotificationSettings(id, integration, settings) {
        const data = settings;
        const url = 'projects/' + id + '/' + integration + '/notifications';
        return this.http.get(url,  { responseType: 'json' });
    }
}

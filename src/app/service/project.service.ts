import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";

@Injectable({
    providedIn: 'root'
})

export class ProjectService extends  BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
    }

    addSlack(id){};

    create(organizationId, name){
        this.route = 'api/v2/projects';
        this.type = 'post';
        this.authentication = true;
        this.data = {
            'organization_id': organizationId,
            'name': name,
            delete_bot_data_enabled: true
        };

        return this.call();
    };

    demoteTab(id, name){
        this.route = 'api/v2/projects/' + id + '/promotedtabs';
        this.type = 'delete';
        this.authentication = true;
        this.data = {
            name: name
        };

        return this.call();
    };

    getAll(options, useCache){
        this.route = 'api/v2/projects?limit=100';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        if (useCache === undefined || useCache) {
            //need to implement later[frank lin]
            return null;
        }

        return this.call();
    };

    getById(id, useCache){
        this.route = 'api/v2/organizations/' + id;
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        if (useCache === undefined || useCache) {
            //need to implement later[frank lin]
            return null;
        }

        return this.call();
    };

    getByOrganizationId(id, options, useCache){
        this.route = 'api/v2/organizations/' + id + '/projects';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    getConfig(id){
        //return _cachedRestangular.one('projects', id).one('config').get();
        this.route = 'api/v2/projects/' + id + '/config';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    getNotificationSettings(id, userId){
        //return _cachedRestangular.one('users', userId).one('projects', id).one('notifications').get();
        this.route = 'api/v2/users/' + userId + '/projects/' + id + '/notifications';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    getIntegrationNotificationSettings(id, integration){
        //return _cachedRestangular.one('projects', id).one(integration, 'notifications').get();
        this.route = 'api/v2/projects/' + id + '/' + integration + '/notifications';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    isNameAvailable(organizationId, name){
        this.route = 'api/v2/organizations/' + organizationId + '/projects/check-name';
        this.type = 'get';
        this.authentication = true;
        this.data = {
            name: encodeURIComponent(name)
        };

        return this.call();
    };

    promoteTab(id, name){
        this.route = 'api/v2/projects/' + id + '/promotedtabs';
        this.type = 'post';
        this.authentication = true;
        this.data = {
            name: name
        };

        return this.call();
    };

    remove(id){
        this.route = 'api/v2/projects/' + id;
        this.type = 'delete';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    removeConfig(id, key){
        this.route = 'api/v2/projects/' + id + '/config';
        this.type = 'delete';
        this.authentication = true;
        this.data = {
            key: key
        };

        return this.call();
    };

    removeData(id, key){
        this.route = 'api/v2/projects/' + id + '/data';
        this.type = 'delete';
        this.authentication = true;
        this.data = {
            key: key
        };

        return this.call();
    };

    removeSlack(id){
        this.route = 'api/v2/projects/' + id + '/slack';
        this.type = 'delete';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    removeNotificationSettings(id, userId){
        this.route = 'api/v2/users/' + userId + '/projects' + id + '/notifications';
        this.type = 'delete';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    resetData(id){
        this.route = 'api/v2/projects/' + id + '/reset-data';
        this.type = 'get';
        this.authentication = true;
        this.data = {};

        return this.call();
    };

    update(id, project){
        this.route = 'api/v2/projects/' + id;
        this.type = 'patch';
        this.authentication = true;
        this.data = project;

        return this.call();
    };

    setConfig(id, key, value){
        this.route = 'api/v2/projects/' + id + '/config/' + value;
        this.type = 'post';
        this.authentication = true;
        this.data = {
            key: key
        };
        this.changeContentType = true;
        this.contentType = 'text/plain; charset=UTF-8';

        return this.call();
    };

    setData(id, key, value){
        this.route = 'api/v2/projects/' + id + '/data/' + value;
        this.type = 'post';
        this.authentication = true;
        this.data = {
            key: key
        };
        this.changeContentType = true;
        this.contentType = 'text/plain; charset=UTF-8';

        return this.call();
    };

    setNotificationSettings(id, userId, settings){
        this.route = 'api/v2/users/' + userId + '/projects/' + id + '/notifications';
        this.type = 'post';
        this.authentication = true;
        this.data = settings;

        return this.call();
    };

    setIntegrationNotificationSettings(id, integration, settings){
        this.route = 'api/v2/projects/' + id + '/' + integration + '/notifications';
        this.type = 'get';
        this.authentication = true;
        this.data = settings;

        return this.call();
    };
}

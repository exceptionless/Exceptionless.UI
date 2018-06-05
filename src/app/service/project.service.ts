import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BasicService} from './basic.service';
import {GlobalVariables} from "../global-variables";

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
    create(organizationId, name){};
    demoteTab(id, name){};

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

    getById(id, useCache){};
    getByOrganizationId(id, options, useCache){};
    getConfig(id){};
    getNotificationSettings(id, userId){};
    getIntegrationNotificationSettings(id, integration){};
    isNameAvailable(organizationId, name){};
    promoteTab(id, name){};
    remove(id){};
    removeConfig(id, key){};
    removeData(id, key){};
    removeSlack(id){};
    removeNotificationSettings(id, userId){};
    resetData(id){};
    update(id, project){};
    setConfig(id, key, value){};
    setData(id, key, value){};
    setNotificationSettings(id, userId, settings){};
    setIntegrationNotificationSettings(id, integration, settings){};
}

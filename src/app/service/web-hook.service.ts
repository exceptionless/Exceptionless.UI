import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class WebHookService {

    constructor(
        private http: HttpClient
    ) {}

    create(webHook) {
        return this.http.post('webhooks', webHook);
    }

    getAll(options) {
        return this.http.get(`webhooks`, { params: options || {} });
    }

    getById(id) {
        return this.http.get(`webhooks/${id}`);
    }

    getByOrganizationId(id, options) {
        return this.http.get(`organizations/${id}/webhooks}`, { params: options || {} });
    }

    getByProjectId(id, options) {
        return this.http.get(`projects/${id}/webhooks}`, { params: options || {} });
    }

    remove(id) {
        return this.http.delete(`webhooks/${id}`);
    }
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NewWebHook, WebHook } from "../models/webhook";
import { WorkInProgressResult } from "../models/results";

@Injectable({
    providedIn: "root"
})
export class WebHookService {
    constructor(private http: HttpClient) {}

    public create(webHook: NewWebHook) {
        return this.http.post<WebHook>("webhooks", webHook).toPromise();
    }

    public getAll(options) {
        return this.http.get<WebHook[]>(`webhooks`, { params: options || {} }).toPromise();
    }

    public getById(id: string) {
        return this.http.get<WebHook>(`webhooks/${id}`).toPromise();
    }

    public getByOrganizationId(id: string, options?) {
        return this.http.get<WebHook[]>(`organizations/${id}/webhooks`, { params: options || {} }).toPromise();
    }

    public getByProjectId(id: string, options?) {
        return this.http.get<WebHook[]>(`projects/${id}/webhooks`, { params: options || {} }).toPromise();
    }

    public remove(id: string) {
        return this.http.delete<WorkInProgressResult>(`webhooks/${id}`).toPromise();
    }
}

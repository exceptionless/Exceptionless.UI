import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Project, NewProject, ClientConfiguration, NotificationSettings } from "../models/project";
import { WorkInProgressResult } from "../models/results";

@Injectable({
    providedIn: "root"
})

export class ProjectService {
    constructor(
        private http: HttpClient,
    ) {}

    public addSlack(id) {
        throw new Error("NOT IMPLEMENTED: Implement client side for getting slack oauth.");
        return this.http.post<never>(`projects/${id}/slack`, { params: { code: "" } }).toPromise();
    }

    public create(organizationId: string, name: string) {
        const data = {
            organization_id: organizationId,
            name,
            delete_bot_data_enabled: true
        } as NewProject;
        return this.http.post<Project>("projects", data).toPromise();
    }

    public demoteTab(id: string, name: string) {
        return this.http.delete<never>(`projects/${id}/promotedtabs`, { params: { name }}).toPromise();
    }

    // TODO: How do we better handle large amounts of projects (e.g. 250 projects)
    public getAll(options?) {
        const mergedOptions = Object.assign({ limit: 100 }, options);
        return this.http.get<Project[]>("projects", { params: mergedOptions }).toPromise();
    }

    public getById(id: string) {
        return this.http.get<Project>(`projects/${id}`).toPromise();
    }

    public getByOrganizationId(id: string, options) {
        return this.http.get<Project[]>(`organizations/${id}/projects`, { params: options || {} }).toPromise();
    }

    public getConfig(id: string) {
        return this.http.get<ClientConfiguration>(`projects/${id}/config`).toPromise();
    }

    public getNotificationSettings(id: string, userId: string) {
        return this.http.get<NotificationSettings>(`users/${userId}/projects/${id}/notifications`).toPromise();
    }

    public getIntegrationNotificationSettings(id: string, integration: string) {
        return this.http.get<NotificationSettings>(`projects/${id}/${integration}/notifications`).toPromise();
    }

    public async isNameAvailable(organizationId: string, name: string): Promise<boolean> {
        const response = await this.http.get(`organizations/${organizationId}/projects/check-name`, { params: { name }}).toPromise();
        return response.status === 204;
    }

    public promoteTab(id: string, name: string) {
        return this.http.post<never>(`projects/${id}/promotedtabs`, { params: { name }}).toPromise();
    }

    public remove(id: string) {
        return this.http.delete<WorkInProgressResult>(`projects/${id}`).toPromise();
    }

    public removeConfig(id: string, key: string) {
        return this.http.delete<never>(`projects/${id}/config`, { params: { key }}).toPromise();
    }

    public removeData(id: string, key: string) {
        return this.http.delete<never>(`projects/${id}/data`, { params: { key }}).toPromise();
    }

    public removeSlack(id: string) {
        return this.http.delete<never>(`projects/${id}/slack`).toPromise();
    }

    public removeNotificationSettings(id: string, userId: string) {
        return this.http.delete<never>(`users/${userId}/projects/${id}/notifications`).toPromise();
    }

    public resetData(id: string) {
        return this.http.get<WorkInProgressResult>(`projects/${id}/reset-data`).toPromise();
    }

    public update(id: string, project: Project) {
        return this.http.patch<Project>(`projects/${id}`, project).toPromise();
    }

    public setConfig(id: string, key: string, value: string|boolean) {
        return this.http.post<never>(`projects/${id}/config`, value, { params: { key } }).toPromise();
    }

    public setData(id: string, key: string, value: string) {
        return this.http.post<never>(`projects/${id}/data/`, value, { params: { key } }).toPromise();
    }

    public setNotificationSettings(id: string, userId: string, settings: NotificationSettings) {
        return this.http.post<never>(`users/${userId}/projects/${id}/notifications`, settings).toPromise();
    }

    public setIntegrationNotificationSettings(id: string, integration: string, settings: NotificationSettings) {
        return this.http.post<never>(`projects/${id}/${integration}/notifications`, settings).toPromise();
    }
}

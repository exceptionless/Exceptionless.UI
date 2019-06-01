import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FilterService } from "./filter.service";
import { Stack } from "../models/stack";
import { WorkInProgressResult } from "../models/network";

@Injectable({ providedIn: "root" })
export class StackService {
    constructor(
        private http: HttpClient,
        private filterService: FilterService,
    ) {}

    public addLink(id: string, url: string) {
        return this.http.post<never>(`stacks/${id}/add-link`, url).toPromise();
    }

    public disableNotifications(id: string) {
        return this.http.delete<never>(`stacks/${id}/notifications`).toPromise();
    }

    public enableNotifications(id: string) {
        return this.http.post<never>(`stacks/${id}/notifications`, {}).toPromise();
    }

    public getAll(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get<Stack[]>(`organizations/${organization}/stacks`, { params: mergedOptions });
        }

        const project = this.filterService.getProjectId();
        if (project) {
            return this.http.get<Stack[]>(`projects/${project}/stacks`, { params: mergedOptions });
        }

        return this.http.get<Stack[]>(`stacks`, { params: mergedOptions });
    }

    public async getById(id) {
        return await this.http.get<Stack>(`stacks/${id}`).toPromise();
    }

    public getFrequent(options?) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (organization) {
            return this.http.get<Stack[]>(`organizations/${organization}/stacks/frequent`, { params: mergedOptions }).toPromise();
        }

        const project = this.filterService.getProjectTypeId();
        if (project) {
            return this.http.get<Stack[]>(`projects/${project}/stacks/frequent`, { params: mergedOptions }).toPromise();
        }

        return this.http.get<Stack[]>("stacks/frequent", { params: mergedOptions }).toPromise();
    }

    public getUsers(options) {
        const mergedOptions = this.filterService.apply(options);

        const organization = this.filterService.getOrganizationId();
        if (typeof organization === "string" && organization) {
            return this.http.get<Stack[]>(`organizations/${organization}/stacks/users`, { params: mergedOptions }).toPromise();
        }

        const project = this.filterService.getProjectTypeId();
        if (typeof project === "string" && project) {
            return this.http.get<Stack[]>(`projects/${project}/stacks/users`, { params: mergedOptions }).toPromise();
        }

        return this.http.get<Stack[]>(`stacks/users`, { params: mergedOptions }).toPromise();
    }

    public getNew(options) {
        const mergedOptions = this.filterService.apply(options);
        const organization = this.filterService.getOrganizationId();
        if (typeof organization === "string" && organization) {
            return this.http.get<Stack[]>(`organizations/${organization}/stacks/new`, { params: mergedOptions }).toPromise();
        }

        const project = this.filterService.getProjectTypeId();
        if (typeof project === "string" && project) {
            return this.http.get<Stack[]>(`projects/${project}/stacks/new`, { params: mergedOptions }).toPromise();
        }

        return this.http.get<Stack[]>(`stacks/new`, { params: mergedOptions }).toPromise();
    }

    public markCritical(id: string) {
        return this.http.post<never>(`stacks/${id}/mark-critical`, {}).toPromise();
    }

    public markNotCritical(id: string) {
        return this.http.delete<never>(`stacks/${id}/mark-critical`).toPromise();
    }

    public markFixed(ids: string[], version?: string) {
        return this.http.post<WorkInProgressResult>(`stacks/${ids.join(",")}/mark-fixed`, { params: { version }}).toPromise();
    }

    public markNotFixed(id: string) {
        return this.http.delete<WorkInProgressResult>(`stacks/${id}/mark-fixed`).toPromise();
    }

    public markHidden(id: string) {
        return this.http.post<WorkInProgressResult>(`stacks/${id}/mark-hidden`, {}).toPromise();
    }

    public markNotHidden(id: string) {
        return this.http.delete<WorkInProgressResult>(`stacks/${id}/mark-hidden`).toPromise();
    }

    public promote(id: string) {
        return this.http.post<never>(`stacks/${id}/promote`, {}).toPromise();
    }

    public remove(id: string) {
        return this.http.delete<WorkInProgressResult>(`stacks/${id}`).toPromise();
    }

    public removeLink(id: string, url: string) {
        return this.http.post<never>(`stacks/${id}/remove-link`, url).toPromise();
    }
}

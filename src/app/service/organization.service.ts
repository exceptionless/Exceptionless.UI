import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ObjectIdService } from "./object-id.service";
import * as moment from "moment";
import { WorkInProgressResult } from "../models/network";
import { Organization, BillingPlan, InvoiceGridModel, NewOrganization, ChangePlanResult } from "../models/organization";
import { User } from "../models/user";

export interface GetInvoiceParameters {
    limit?: number;
    before?: string;
    after?: string;
}


@Injectable({
    providedIn: "root"
})

export class OrganizationService {
    constructor(
        private http: HttpClient, // TODO: Caching...
        private objectIdService: ObjectIdService,
    ) {}

    public addUser(id: string, email: string) {
        return this.http.post<User>(`organizations/${id}/users/${email}`, {}).toPromise();
    }

    public create(name: string) {
        return this.http.post<Organization>("organizations", { name } as NewOrganization).toPromise();
    }

    public changePlan(id: string, options) {
        return this.http.post<ChangePlanResult>(`organizations/${id}/change-plan`, {}, { params: options }).toPromise();
    }

    public getOldestCreationDate(organizations: Organization[]): Date {
        if (organizations) {
            if (organizations.length > 1) {
                return new Date(Math.min(...organizations.map(o => this.objectIdService.getDate(o.id).getTime())));
            }

            if (organizations.length === 1) {
                return this.objectIdService.getDate(organizations[0].id);
            }
        }

        return new Date(2012, 1, 1);
    }

    public getOldestRetentionStartDate(organizations: Organization[], maximumRetentionDays?: number): Date {
        if (!maximumRetentionDays) {
            maximumRetentionDays = moment().diff(new Date(2012, 1, 1), "days");
        }

        let retentionDays: number = maximumRetentionDays;

        if (organizations) {
            if (organizations.length > 1) {
                retentionDays = Math.max(...organizations.map(o => o.retention_days > 0 ? o.retention_days : maximumRetentionDays));
            } else if (organizations.length === 1) {
                retentionDays = organizations[0].retention_days;
            }
        }

        return retentionDays <= 0 ? new Date(2012, 1, 1) : moment().subtract(retentionDays, "days").toDate();
    }

    public getOldestPossibleEventDate(organizations: Organization[], maximumRetentionDays?: number): Date {
        return moment.max([
            moment(this.getOldestCreationDate(organizations)).subtract(3, "days"),
            moment(this.getOldestRetentionStartDate(organizations, maximumRetentionDays))
        ]).toDate();
    }

    public getAll(options?) {
        const mergedOptions = Object.assign({ limit: 100 }, options);
        return this.http.get<Organization[]>("organizations", { params: mergedOptions }).toPromise();
    }

    public getById(id: string) {
        return this.http.get<Organization>(`organizations/${id}`).toPromise();
    }

    public getInvoice(id: string) {
        return this.http.get<InvoiceGridModel>(`organizations/invoice/${id}`).toPromise();
    }

    public getInvoices(id: string, options?: GetInvoiceParameters) {
        const params: any = options || {};
        return this.http.get<InvoiceGridModel[]>(`organizations/${id}/invoices`, { params }).toPromise();
    }

    public getPlans(id: string) {
        return this.http.get<BillingPlan[]>(`organizations/${id}/plans`).toPromise();
    }

    public async isNameAvailable(name: string): Promise<boolean> {
        const response: any = await this.http.get(`organizations/check-name`, { params: { name }}).toPromise();
        return response.status === 204;
    }

    public remove(id: string) {
        return this.http.delete<WorkInProgressResult>(`organizations/${id}`).toPromise();
    }

    public removeUser(id: string, email: string) {
        return this.http.delete<never>(`organizations/${id}/users/` + email).toPromise();
    }

    public update(id: string, organization: Organization) {
        return this.http.patch<Organization>(`api/v2/organizations/${id}`, organization).toPromise();
    }
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User, UpdateEmailAddressResult, CurrentUser } from "../models/user";
import { WorkInProgressResult, SuccessResult } from "../models/network";

@Injectable({ providedIn: "root" })
export class UserService {
    constructor(private http: HttpClient) {}

    public addAdminRole(id: string) {
        this.http.post<never>(`users/${id}/admin-role`, {}).toPromise();
    }

    public getCurrentUser() {
        return this.http.get<CurrentUser>("users/me").toPromise();
    }

    public getById(id: string) {
        return this.http.get<User>(`users/${id}`);
    }

    public getByOrganizationId(id: string, options) {
        return this.http.get<User[]>(`organizations/${id}/users`, { params: options }).toPromise();
    }

    public hasAdminRole(user: User): boolean {
        return this.hasRole(user, "global");
    }

    public hasRole(user: User, role: string): boolean {
        return !!user && !!user.roles && user.roles.indexOf(role) !== -1;
    }

    public removeAdminRole(id: string) {
        return this.http.delete<never>(`users/${id}/admin-role`).toPromise();
    }

    public removeCurrentUser() {
        return this.http.delete<WorkInProgressResult>("users/me").toPromise();
    }

    public resendVerificationEmail(id: string) {
        return this.http.get<never>(`users/${id}/resend-verification-email`).toPromise();
    }

    public update(id: string, user: User) {
        return this.http.patch<User>(`users/${id}`, user).toPromise();
    }

    public updateEmailAddress(id: string, email: string) {
        return this.http.post<UpdateEmailAddressResult>(`users/${id}/email-address/${email}`, {}).toPromise();
    }

    public verifyEmailAddress(token: string) {
        return this.http.get<never>(`users/verify-email-address/${token}`);
    }

    public adminChangePlan(organizationId: string, planId: string) {
        return this.http.post<SuccessResult>("admin/change-plan", { organizationId, planId }).toPromise();
    }
}

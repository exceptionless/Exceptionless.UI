import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})

export class UserService {

    authUser: any = {};

    constructor(
        private http: HttpClient
    ) {}

    setAuthUser(userData) {
        this.authUser = userData;
    }

    addAdminRole(id) {
        const data = {};
        return this.http.post(`users/${id}/admin-role`,  data).toPromise();
    }

    getCurrentUser() {
        return this.http.get('users/me').toPromise();
    }

    getById(id) {
        return this.http.get(`users/${id}`);
    }

    getByOrganizationId(id, options): Observable<HttpResponse<any>> {
        return this.http.get(`organizations/${id}/users`, { observe: 'response', params: options });
    }

    hasAdminRole(user) {
        return this.hasRole(user, 'global');
    }

    hasRole(user, role) {
        return !!user && !!user.roles && user.roles.indexOf(role) !== -1;
    }

    removeAdminRole(id) {
        return this.http.delete(`users/${id}/admin-role`).toPromise();
    }

    removeCurrentUser() {
        return this.http.delete('users/me').toPromise();
    }

    resendVerificationEmail(id) {
        return this.http.get(`users/${id}/resend-verification-email`).toPromise();
    }

    update(id, project) {
        return this.http.patch(`users/${id}`, project).toPromise();
    }

    updateEmailAddress(id, email) {
        const data = {};
        return this.http.post(`users/${id}/email-address/${email}`,  data).toPromise();
    }

    verifyEmailAddress(token) {
        return this.http.get(`users/verify-email-address/${token}`);
    }

    adminChangePlan(data) {
        return this.http.post('admin/change-plan', data).toPromise();
    }
}

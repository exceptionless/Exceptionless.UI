import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class TokenService {
    constructor(
        private http: HttpClient
    ) {}

    create(options) {
        const token = {
            'organization_id': options['organization_id'],
            'project_id': options['project_id'],
            'scopes': ['client']
        };

        return this.http.post('tokens', token).toPromise();
    }

    getById(id) {
        return this.http.get(`tokens/${id}`);
    }

    getByOrganizationId(id, options) {
        return this.http.get(`organizations/${id}/tokens`, { params: options });
    }

    getByProjectId(id, options?) {
        return this.http.get(`projects/${id}/tokens`, { params: options }).toPromise();
    }

    getProjectDefault(id) {
        return this.http.get(`projects/${id}/tokens/default`).toPromise();
    }

    remove(id) {
        return this.http.delete(`tokens/${id}`).toPromise();
    }

    update(id, token) {
        return this.http.patch(`tokens/${id}`, token).toPromise();
    }
}

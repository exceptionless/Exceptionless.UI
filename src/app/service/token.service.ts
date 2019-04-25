import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Token, NewToken } from "../models/token";
import { WorkInProgressResult } from "../models/network";

@Injectable({
    providedIn: "root"
})

export class TokenService {
    constructor(
        private http: HttpClient
    ) {}

    public create(token: NewToken) {
        return this.http.post<Token>("tokens", Object.assign({}, token, { scopes: ["client"] }) as NewToken).toPromise();
    }

    public getById(id: string) {
        return this.http.get<Token>(`tokens/${id}`).toPromise();
    }

    public getByOrganizationId(id: string, options) {
        return this.http.get<Token[]>(`organizations/${id}/tokens`, { params: options }).toPromise();
    }

    public getByProjectId(id: string, options?) {
        return this.http.get<Token[]>(`projects/${id}/tokens`, { params: options }).toPromise();
    }

    public getProjectDefault(id: string) {
        return this.http.get<Token>(`projects/${id}/tokens/default`).toPromise();
    }

    public remove(id: string) {
        return this.http.delete<WorkInProgressResult>(`tokens/${id}`).toPromise();
    }

    public update(id: string, token: Token) {
        return this.http.patch<Token>(`tokens/${id}`, token).toPromise();
    }
}

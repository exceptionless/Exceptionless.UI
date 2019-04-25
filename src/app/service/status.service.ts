import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AboutResult } from "../models/results";


@Injectable({
    providedIn: "root"
})
export class StatusService {

    constructor(
        private http: HttpClient,
    ) {}

    public get() {
        return this.http.get<AboutResult>(`about`).toPromise();
    }

    public healthy() {
        return this.http.get("health", { responseType: "text" }).toPromise();
    }
}

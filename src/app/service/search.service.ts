import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { QueryProcessResult } from "../models/results";

@Injectable({
    providedIn: "root"
})

export class SearchService {
    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
    ) {}

    public async validate(query: string): Promise<QueryProcessResult> {
        if (!query || (query.trim && query.trim() === "*")) {
            return {
                is_valid: true,
                uses_premium_features: false
            } as QueryProcessResult;
        }

        try {
            return await this.http.get<QueryProcessResult>("search/validate", { params: {query } }).toPromise();
        } catch (ex) {
            this.toastr.error("Error Occurred!", "Failed");
            throw ex;
        }
    }
}

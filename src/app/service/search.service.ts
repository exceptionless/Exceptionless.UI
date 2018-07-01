import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class SearchService {

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
    ) {
    }

    validate(query) {
        if (!query || (query.trim && query.trim() === '*')) {
            return new Promise((resolve, reject) => {
                resolve({
                    data: {
                        is_valid: true,
                        uses_premium_features: false
                    }
                });
            });
        }

        const data = { query: query };
        return new Promise((resolve, reject) => {
            this.http.get('search/validate', { responseType: 'json' }).subscribe(
                res => {
                    resolve(JSON.parse(JSON.stringify(res)));
                },
                err => {
                    this.toastr.error('Error Occurred!', 'Failed');
                    reject(err);
                }
            );
        });
    }
}

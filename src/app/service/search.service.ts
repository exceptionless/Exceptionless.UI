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
    ) {}

    async validate(query) {
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

        try {
            const res = await this.http.get('search/validate', { responseType: 'json' }).toPromise();
            return JSON.parse(JSON.stringify(res));
        } catch (err) {
            this.toastr.error('Error Occurred!', 'Failed');
            return err;
        }
    }
}

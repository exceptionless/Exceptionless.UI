import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BasicService } from './basic.service';
import { GlobalVariables } from "../global-variables";
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class SearchService extends BasicService {

    constructor(
        http: HttpClient,
        _global: GlobalVariables,
        private toastr: ToastrService,
    ) {
        super(http, _global);
        this.route = '';
        this.type = '';
        this.data = {};
        this.authentication = false;
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

        this.route = 'api/v2/search/validate';
        this.type = 'get';
        this.data = { query: query };
        this.authentication = true;

        return new Promise((resolve, reject) => {
            this.call().subscribe(
                res=> {
                    resolve(JSON.parse(JSON.stringify(res)));
                },
                err=>{
                    this.toastr.error('Error Occurred!', 'Failed');
                    reject(err);
                },
                () => console.log('Validate Service called!')
            );
        });
    };
}

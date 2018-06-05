import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariables } from "../global-variables"

@Injectable()
export class BasicService {
    route: string;
    data: {};
    type = 'post';
    authentication: boolean = false;

    constructor(
        private http: HttpClient,
        private _global: GlobalVariables,
    ) {
        this.data = {};
        this.type = 'post';
        this.route = '';
    }

    call () {
        let full_url = this._global.BASE_URL + this.route;

        if (this.type === 'get') {
            for (let key in this.data) {
                const value = this.data[key];
                full_url = full_url + '&' + key + '=' + value;
            }


            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer FH3nPP9K6YTV0j0bgreKTZK2XzrqZcvAjwnsBLME'
                    })
                };

                return this.http.get(full_url, httpOptions);
            } else {
                return this.http.get(full_url);
            }

        } else if (this.type === 'post') {
            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer FH3nPP9K6YTV0j0bgreKTZK2XzrqZcvAjwnsBLME'
                    })
                };

                return this.http.post(full_url, this.data, httpOptions);
            } else {
                return this.http.post(full_url, this.data, { responseType: 'json' });
            }
        }
    }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class BasicService {
    baseUrl: string;
    route: string;
    data: {};
    type = 'post';

    constructor(private http: HttpClient) {
        this.baseUrl = 'https://api.exceptionless.io/';
        this.data = {};
        this.type = 'post';
    }

    call () {
        let full_url = this.baseUrl + this.route;

        if (this.type === 'get') {
            for (let key in this.data) {
                const value = this.data[key];
                full_url = full_url + '&' + key + '=' + value;
            }

            return this.http.get(full_url);
        } else if (this.type === 'post') {
            return this.http.post(full_url, this.data, { responseType: 'json' });
        }
    }
}

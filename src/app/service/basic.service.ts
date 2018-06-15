import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariables } from "../global-variables"

@Injectable()
export class BasicService {
    route: string;
    data: {};
    type = 'post';
    authentication: boolean = false;
    changeContentType: boolean = false;
    contentType: string = ''

    constructor(
        private http: HttpClient,
        private _global: GlobalVariables,
    ) {
        this.data = {};
        this.type = 'post';
        this.route = '';
    }

    call () {
        let full_url = this._global.BASE_URL + this.route ;

        if (this.type === 'get') {
            full_url = full_url + '?token=9229slsdi3d';
            for (let key in this.data) {
                const value = this.data[key];
                full_url = full_url + '&' + key + '=' + value;
            }

            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                    })
                };

                if(this.changeContentType) {
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Content-Type':  this.contentType,
                            'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                        })
                    };

                    return this.http.get(full_url, httpOptions);
                }

                return this.http.get(full_url, httpOptions);
            } else {
                return this.http.get(full_url);
            }

        } else if (this.type === 'post') {
            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                    })
                };

                if(this.changeContentType) {
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Content-Type':  this.contentType,
                            'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                        })
                    };

                    return this.http.post(full_url, this.data, httpOptions);
                }

                return this.http.post(full_url, this.data, httpOptions);
            } else {
                return this.http.post(full_url, this.data, { responseType: 'json' });
            }
        } else if (this.type === 'delete') {
            full_url = full_url + '?token=9229slsdi3d';
            for (let key in this.data) {
                const value = this.data[key];
                full_url = full_url + '&' + key + '=' + value;
            }

            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                    })
                };

                return this.http.delete(full_url, httpOptions);
            } else {
                return this.http.delete(full_url, { responseType: 'json' });
            }
        } else if (this.type === 'patch') {
            if(this.authentication) {
                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer OglJsb3tJxLogSF6f2hprsCYCHQAVZjQ54Oq26rr'
                    })
                };

                return this.http.patch(full_url, this.data, httpOptions);
            } else {
                return this.http.patch(full_url, this.data, { responseType: 'json' });
            }
        }
    }
}

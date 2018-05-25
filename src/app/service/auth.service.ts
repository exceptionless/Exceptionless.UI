import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BasicService } from './basic.service';

@Injectable()
export class AuthService extends BasicService {
    constructor(
        http: HttpClient
    ) {
        super(http);
        this.route = '';
        this.type = '';
        this.data = {};
    }

    login(credential) {
        this.route = 'api/v2/auth/login';
        this.type = 'post';
        this.data = credential;
        return this.call();
    }

    signup(user) {
        this.route = 'api/v2/auth/signup';
        this.type = 'post';
        this.data = user;
        return this.call();
    }

    checkEmailUnique(email) {
        this.route = 'api/v2/auth/check-email-address/' + email;
        this.type = 'get';
        this.data = {};
        return this.call();
    }
}

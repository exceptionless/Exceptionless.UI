import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthCheckService {

    constructor() {
    }

    public isAuthenticated(): boolean {
        const token = localStorage.getItem('access_token');

        // Check whether the token is expired and return
        // true or false
        if(token) {
            return true;
        } else {
            return false;
        }
    }
}

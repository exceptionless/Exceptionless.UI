import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { AuthCheckService } from "./auth-check.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService {

    constructor(
        public authCheck: AuthCheckService,
        public router: Router
    ) {}

    canActivate(): boolean {
        if (!this.authCheck.isAuthenticated()) {
            this.router.navigate(['login']);
            return false;
        }

        return true;
    }
}

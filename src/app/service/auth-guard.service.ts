import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'ng2-ui-auth';
import { Observable } from 'rxjs/Observable';

@Injectable({
    providedIn: 'root'
})

export class AuthGuardService implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.isAuthenticated()) {
            return true;
        }
        this.router.navigate(['/login'], { queryParams: next.queryParams });
        return false;
    };
}

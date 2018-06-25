import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from 'ng2-ui-auth';
import { GlobalVariables } from '../global-variables';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private auth: AuthService,
        private globalVariables: GlobalVariables
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.auth.getToken()}`
            },
            url: this.globalVariables.BASE_URL + request.url
        });
        return next.handle(request);
    }
}

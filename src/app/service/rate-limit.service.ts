import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RateLimitService {
    _rateLimit = -1;
    _rateLimitExceeded = false;
    _rateLimitRemaining = -1;

    constructor() {
    }

    rateLimitExceeded() {
        return this._rateLimitExceeded;
    }

    updateFromResponseHeader(response) {
        const limit = parseInt(response.headers('X-RateLimit-Limit'), 10);
        this._rateLimit = !isNaN(limit) ? limit : -1;

        const limitRemaining = parseInt(response.headers('X-RateLimit-Remaining'), 10);
        this._rateLimitRemaining = !isNaN(limitRemaining) ? limitRemaining : -1;

        this._rateLimitExceeded = this._rateLimit > 0 ? this._rateLimitRemaining <= 0 : false;
    }
}
